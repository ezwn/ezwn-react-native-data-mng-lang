
export const csvLineExtract = (line) => {

    let value = null;
    let row = [];

    const addToValue = (char) => {
        if (!value)
            value = char;
        else
            value += char;
    }

    const flushValue = () => {
        if (value === null)
            return;

        row.push(value);
        value = null;
    }

    let inQuote = false;

    for (let c of line) {
        switch (c) {
            case '"':
                inQuote = !inQuote;
                break;
            case ' ':
            case '\t':
            case '\xa0':
                if (inQuote) {
                    addToValue(c);
                } else {
                    flushValue();
                }
                break;
            default:
                addToValue(c);
                break;
        }
    }

    flushValue();
    return row;
}
