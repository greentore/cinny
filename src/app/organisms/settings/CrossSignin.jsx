import React from 'react';

import initMatrix from '../../../client/initMatrix';
import { hasCrossSigninAccountData } from '../../../util/matrixUtil';

import Text from '../../atoms/text/Text';
import Button from '../../atoms/button/Button';
import SettingTile from '../../molecules/setting-tile/SettingTile';

function CrossSignin() {
  return (
    <SettingTile
      title="Cross sign-in"
      content={<Text variant="b3">Setup to verify and keep track of all your devices. Also required to enable secure encryption key backup.</Text>}
      options={(
        hasCrossSigninAccountData()
          ? <Button variant="danger">Reset</Button>
          : <Button variant="primary">Setup</Button>
      )}
    />
  );
}

export default CrossSignin;
