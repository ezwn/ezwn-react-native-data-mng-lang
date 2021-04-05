import React, { useEffect, useState } from "react";
import { View } from "react-native";

import { Field } from "ezwn-ux-native/forms/Field-cmp";

import { AutoInput } from "./AutoInput-cmp";

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
