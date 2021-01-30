import React, { useEffect, useState } from "react";
import { View } from "react-native";

import { TextInput } from "ezwn-ux-native/forms/TextInput-cmp";
import { NumberInput } from "ezwn-ux-native/forms/NumberInput-cmp";
import { Field } from "ezwn-ux-native/forms/Field-cmp";
import { DateTimeInput } from "ezwn-ux-native/forms/DateTimeInput-cmp";
import { DurationInput } from "ezwn-ux-native/forms/DurationInput-cmp";
import { PickerInput } from "ezwn-ux-native/forms/PickerInput-cmp";

const idToLabel = str => str[0].toUpperCase() + str.replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`).substring(1);

export const AutoForm = ({ schema, data, updateData, structKey, exclude, clientMap, customInputMap, onValidityChange }) => {
    const { structs } = schema;
    let [validityMap, setValidityMap] = useState({});

    const struct = structs[structKey];
    const { props } = struct;

    const shouldNotExcludeFn = key => exclude.indexOf(key) === -1 && !props[key].isId && !props[key].isModificationTime && !props[key].isDeletedFlag;

    const createOnValidityChange = (propId) => (valid) => {
        validityMap = { ...validityMap, [propId]: valid };
        setValidityMap(validityMap);
    }

    useEffect(() => {
        if (onValidityChange && props) {
            const propKeys = Object.keys(props).filter(shouldNotExcludeFn);

            const globalValidity = propKeys.map(key => !!validityMap[key])
                .reduce((accumulator, currentValue) => accumulator && currentValue, true);

            // console.log("validityMap change:", globalValidity, validityMap)

            onValidityChange(globalValidity);
        }
    }, [props, validityMap, onValidityChange]);

    const modificationTime = Object.keys(props).find(key => props[key].isModificationTime);

    const onChange = (key, value) => {
        const meta = modificationTime ? { [modificationTime]: new Date().toISOString().substring(0, 19) } : {};
        updateData({ ...meta, [key]: value });
    };

    return <View>
        {
            Object.keys(props)
                .filter(shouldNotExcludeFn)
                .map(key => <Field key={key} label={idToLabel(props[key].id)}>
                    <AutoInput
                        type={props[key].type}
                        value={data[key]}
                        onChange={value => onChange(key, value)}
                        onValidityChange={createOnValidityChange(key)}
                        clientMap={clientMap}
                        CustomInput={customInputMap[key]}
                    />
                </Field>)
        }
    </View>
}

AutoForm.defaultProps = {
    exclude: [],
    customInputMap: {}
};

const AutoInput = ({ type, value, onChange, onValidityChange, clientMap, CustomInput }) => {
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
            const client = clientMap[primitive];
            return <PickerInput
                client={client}
                onChange={onChange}
                value={value}
                onValidityChange={onValidityChange}
            />;
    }
}
