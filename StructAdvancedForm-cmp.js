import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Text } from "react-native";

import { useSchema } from "./Schema-ctx";
import { StructForm } from "./StructForm-cmp";
import { VerticalBorderLayout } from "ezwn-ux-native/layouts/VerticalBorderLayout-cmp";
import { ContextualMenu } from "ezwn-ux-native/app-components/ContextualMenu-cmp";
import { FontAwesomeTextIcon } from "ezwn-ux-native/text-icons/FontAwsomeTextIcon-cmp";
import { Padded } from "ezwn-ux-native/layouts/Padded-cmp";

/**
 * A form based on a struct and capable to interract with the persist microservice.
 */
export const StructAdvancedForm = ({ repository, structId, id, onNameChanged, clientMap, labelProp, showOwner }) => {
  const { schema } = useSchema();
  const { list, replace } = repository;
  const history = useHistory();
  const [valid, setValid] = useState(false);
  const [item, setItem] = useState(list.find(r => r.id === id));
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setItem(list.find(r => r.id === id))
  }, [list, id]);

  useEffect(() => {
    if (item) {
      onNameChanged(item[labelProp]);
    }
  }, [item]);

  if (!item) {
    history.goBack();
    return <></>
  }

  const updateItem = (patchMap) => {
    const newItem = { ...item, ...patchMap }
    // console.log(`Item changed:`, newItem, valid)
    setItem(newItem);

    if (valid) {
      replace(newItem);
    }
  }

  return deleting ? <ConfirmDelete repository={repository} id={id} setDeleting={setDeleting} /> : (
    <VerticalBorderLayout bottom={<ContextMenu setDeleting={setDeleting} valid={valid} />}>
      <StructForm
        struct={schema.structs[structId]}
        data={item}
        updateData={updateItem}
        clientMap={clientMap}
        onValidityChange={setValid}
        showOwner={showOwner}
      />
    </VerticalBorderLayout>
  );
};

const ContextMenu = ({ valid, setDeleting }) => {
  const history = useHistory();

  return (
    <ContextualMenu>
      <ContextualMenu.Choice onPress={() => setDeleting(true)}>
        <FontAwesomeTextIcon fontAwesomeIcon="faMinus" text="Delete" />
      </ContextualMenu.Choice>
      <ContextualMenu.Choice onPress={() => history.goBack()} enabled={valid}>
        <FontAwesomeTextIcon fontAwesomeIcon="faCheck" text="Ok" />
      </ContextualMenu.Choice>
    </ContextualMenu>
  );
};

const CofirmContextMenu = ({ repository, id, setDeleting }) => {
  const { deleteById } = repository;

  return (
    <ContextualMenu>
      <ContextualMenu.Choice onPress={() => setDeleting(false)} >
        <FontAwesomeTextIcon fontAwesomeIcon="faTimes" text="No !" />
      </ContextualMenu.Choice>
      <ContextualMenu.Choice onPress={() => deleteById(id)}>
        <FontAwesomeTextIcon fontAwesomeIcon="faCheck" text="Delete" />
      </ContextualMenu.Choice>
    </ContextualMenu>
  );
};

const ConfirmDelete = ({ repository, id, setDeleting }) => {
  return <VerticalBorderLayout bottom={<CofirmContextMenu repository={repository} id={id} setDeleting={setDeleting} />}>
    <Padded><Text style={{ fontSize: 30, color: "red" }}>Sure to delete ???</Text></Padded>
  </VerticalBorderLayout>

}
