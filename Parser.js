import { csvLineExtract } from "./csv.js";

const parseValue = (type, value) => {
  switch (type) {
    case "Int":
      return parseInt(value);
    default:
      return value;
  }
}

const arrayToObjects = (array, { props }) => {
  const propList = Object.values(props).sort((p1, p2) => p1.order - p2.order);
  const object = {};
  propList.forEach((prop, i) => {
    object[prop.id] = parseValue(prop.type.primitive, array[i]);
  })
  return object;
}

class Parser {
  structs = {};
  spaces = {};
  currentStruct = null;
  currentSpace = null;

  parse = (text) => {
    text.split("\n")
      .map(line => {
        const commentOffset = line.indexOf("# ");
        return commentOffset===-1 ? line.trim() : line.substring(0, commentOffset).trim();
      })
      .filter(line => line!=="")
      .forEach(line => {
        this.newLine(line)
      });

    const schema = { structs: this.structs, spaces: this.spaces };
    // console.log(JSON.stringify(schema, null, 3));
    return schema;
  }

  newLine = (line) => {
    if (line.startsWith("struct ")) {
      this.newStruct(line);
    } else if (line.startsWith("space<") || line.startsWith("finite space<")) {
      this.newSpace(line);
    } else if (line.startsWith("repo<")) {
      this.newRepo(line);
    } else if (this.currentStruct) {
      this.addToStruct(line);
    } else if (this.currentSpace) {
      this.addToSpace(line);
    }
  }

  newStruct = (line) => {
    this.currentSpace = null;
    const [, id] = line.split(" ");
    this.currentStruct = {
      id,
      props: {}
    };
    this.structs[id] = this.currentStruct;
  }

  addToStruct = (line) => {
    const [declaration, conditions] = line.split(" | ");
    const [prefixedPropId, propTypeStr] = declaration.split(": ");
    const [, primitive, , size, , valueRange, , mult] = propTypeStr.match(/([\d\w]+)(\(([\d\.,]*)\))?(\<([\d\.]*)\>)?(\[([\d\.]*)\])?/);

    const isId = prefixedPropId.startsWith("#") || prefixedPropId.startsWith("$");
    const isModificationTime = prefixedPropId.startsWith("*");
    const isOwner = prefixedPropId.startsWith("@");
    const isDeletedFlag = prefixedPropId.startsWith("-");
    const propId = (isId || isModificationTime || isDeletedFlag || isOwner) ? prefixedPropId.substring(1) : prefixedPropId;

    const parseRange = (rangeStr) => {
      if (!rangeStr)
        return null;

      return rangeStr.split("..").map(parseFloat);
    }

    this.currentStruct.props[propId] = {
      isId,
      isModificationTime,
      isDeletedFlag,
      isOwner,
      id: propId,
      type: {
        primitive,
        size: parseRange(size),
        mult: parseRange(mult),
        valueRange: parseRange(valueRange)
      },
      order: Object.keys(this.currentStruct.props).length
    };
  }

  newSpace = (line) => {
    const [, struct] = line.match(/space<([A-Za-z0-9]+)>/);
    this.currentStruct = null;
    this.currentSpace = {
      struct,
      values: []
    };
    this.spaces[struct] = this.currentSpace;
  }

  newRepo = (line) => {
    this.currentStruct = null;
    this.currentSpace = null;
  }

  addToSpace = (line) => {
    const row = csvLineExtract(line);
    const object = arrayToObjects(row, this.structs[this.currentSpace.struct]);
    this.currentSpace.values.push(object);
  }
}

export const parseSchemaText = (text) => {
  return new Parser().parse(text);
}
