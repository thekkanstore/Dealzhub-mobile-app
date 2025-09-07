import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import UserDetailsForm from '../../forms/UserDetails/UserDetailsForm';

const UserDetails = () => {
  return (
    <View style={{flex: 1}}>
      <UserDetailsForm />
    </View>
  );
};

export default UserDetails;

const styles = StyleSheet.create({});
