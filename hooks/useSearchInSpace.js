import { useSchema } from "../Schema-ctx";

export const useSearchInSpace = (structId, valueProp, labelProp) => {
    const { schema } = useSchema();
    const { spaces } = schema;
    const { values } = spaces[structId];

    return async () => values
        .map(val => ({ value: val[valueProp], label: val[labelProp] }));
}
