import React from 'react';
import {Text, View} from 'react-native';
import { useLocationPermission } from '../../hooks/useLocationPermission';

const Home = () => {
  const {getCurrentLocation, requestLocationPermission} = useLocationPermission();

  React.useEffect(() => {
    requestLocationPermission();
  },[])

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <Text>Home</Text>
    </View>
  );
};

export default Home;
