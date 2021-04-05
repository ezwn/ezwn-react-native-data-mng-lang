import React, { useEffect, useState } from "react";

import { TextInput } from "ezwn-ux-native/forms/TextInput-cmp";
import { NumberInput } from "ezwn-ux-native/forms/NumberInput-cmp";
import { DateTimeInput } from "ezwn-ux-native/forms/DateTimeInput-cmp";
import { DurationInput } from "ezwn-ux-native/forms/DurationInput-cmp";
import { PickerInput } from "ezwn-ux-native/forms/PickerInput-cmp";

export const TypeInput = ({ type, value, onChange, onValidityChange, clientMap, CustomInput }) => {
    return <>{
        CustomInput
            ? <CustomInput value={value} onChange={onChange} onValidityChange={onValidityChange} />
            : innerComponent(type, value, onChange, onValidityChange, clientMap)
    }</>
}

const innerComponent = (type, value, onChange, onValidityChange, clientMap) => {
    const { primitive, size, mult, valueRange } = type;
    // console.log(primitive, size, mult, valueRange);

    const nullable = !!mult && mult[0] === 0;

    switch (primitive) {
        case "int":
        case "decimal":
            return <NumberInput
                onChange={onChange}
                onValidityChange={onValidityChange}
                value={value}
                nullable={nullable}
                min={valueRange && valueRange[0]}
                max={valueRange && valueRange[1]}
            />
        case "datetime":
            return <DateTimeInput
                onChange={onChange}
                value={value}
                onValidityChange={onValidityChange}
            />
        case "duration":
            return <DurationInput
                onChange={onChange}
                value={value}
                onValidityChange={onValidityChange}
            />
        case "password":
            return <TextInput
                value={value}
                onChange={onChange}
                onValidityChange={onValidityChange}
                secureTextEntry={true}
                nullable={nullable}
                minLength={size && size[0]}
                maxLength={size && size[1]}
            />
        case "email":
            return <TextInput
                value={value}
                onChange={onChange}
                onValidityChange={onValidityChange}
                nullable={nullable}
                minLength={size && size[0]}
                maxLength={size && size[1]}
                pattern={/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/}
            />
        case "text":
            const multiline = !type.size;

            return <TextInput
                onChange={onChange}
                value={value}
                multiline={multiline}
                height={multiline ? 80 : undefined}
                nullable={nullable}
                minLength={size && size[0]}
                maxLength={size && size[1]}
                onValidityChange={onValidityChange}
            />
        default:
            if (clientMap) {
                const client = clientMap[primitive];
                
                if (!client)
                    throw `No client for "${primitive}"`;

                return <PickerInput
                    client={client}
                    onChange={onChange}
                    value={value}
                    onValidityChange={onValidityChange}
                />;
            } else {
                return <TextInput
                    onChange={onChange}
                    value={value}
                    nullable={nullable}
                    minLength={size && size[0]}
                    maxLength={size && size[1]}
                    onValidityChange={onValidityChange}
                />
            }
    }
}
