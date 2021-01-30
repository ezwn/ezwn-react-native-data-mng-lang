import { useSchema } from "../Schema-ctx";

export const useFindByIdInSpace = (structId, idProp) => {
    const { schema } = useSchema();
    const { spaces } = schema;
    const { values } = spaces[structId];

    return async (id) => values
        .find(item => item[idProp] === id);
}
