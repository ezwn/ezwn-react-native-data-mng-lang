import React, { useEffect, useState } from "react";
import { View } from "react-native";

import { Field } from "ezwn-ux-native/forms/Field-cmp";

import { TypeInput } from "./TypeInput-cmp";

const idToLabel = str => str[0].toUpperCase() + str.replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`).substring(1);

/**
 * A form based on a struct.
 */
export const StructForm = ({ struct, data, updateData, onValidityChange, clientMap, customInputMap, showOwner }) => {

    let [validityMap, setValidityMap] = useState({});
    const { props } = struct;

    const propSelectorFn = propId =>
        !props[propId].isId
        && !props[propId].isModificationTime
        && !props[propId].isDeletedFlag
        && (showOwner || !props[propId].isOwner);

    const createOnValidityChange = (propId) => (valid) => {
        validityMap = { ...validityMap, [propId]: valid };
        setValidityMap(validityMap);
    }

    useEffect(() => {
        if (onValidityChange && props) {
            const propKeys = Object.keys(props).filter(propSelectorFn);

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
                .filter(propSelectorFn)
                .map(propId => <Field key={propId} label={idToLabel(propId)}>
                    <TypeInput
                        type={props[propId].type}
                        value={data[propId]}
                        onChange={value => onChange(propId, value)}
                        onValidityChange={createOnValidityChange(propId)}
                        clientMap={clientMap}
                        CustomInput={customInputMap[propId]}
                    />
                </Field>)
        }
    </View>
}

StructForm.defaultProps = {
    customInputMap: {},
    showOwner: false
};
