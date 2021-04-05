import React, { useEffect } from "react";
import { useHistory } from "react-router";

import { ListItem } from "ezwn-ux-native/list/ListItem-cmp";
import { VerticalBorderLayout } from "ezwn-ux-native/layouts/VerticalBorderLayout-cmp";
import { ContextualMenu } from "ezwn-ux-native/app-components/ContextualMenu-cmp";
import { FontAwesomeTextIcon } from "ezwn-ux-native/text-icons/FontAwsomeTextIcon-cmp";

const ContextMenu = ({ useRepository, routerLocation }) => {
  const { insertNew } = useRepository();
  const history = useHistory();

  return (
    <ContextualMenu>
      <ContextualMenu.Choice onPress={() => {
        const item = insertNew();
        history.push(`${routerLocation}/${item.id}`);
      }}>
        <FontAwesomeTextIcon fontAwesomeIcon="faPlus" text="New" />
      </ContextualMenu.Choice>
    </ContextualMenu>
  );
};

export const CrudList = ({ routerLocation, ItemContentComponent, useRepository }) => {
  const history = useHistory();
  const { list, findAll } = useRepository();
  useEffect(findAll, [findAll]);

  return <VerticalBorderLayout bottom={<ContextMenu useRepository={useRepository} routerLocation={routerLocation} />}>
    {list.map(item => <ListItem key={item.id} onPress={() => history.push(`${routerLocation}/${item.id}`)}>
      <ItemContentComponent item={item} />
    </ListItem>)}
  </VerticalBorderLayout>
};
