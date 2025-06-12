import {useState} from 'react';
import {Alert, Button, StyleSheet, View} from 'react-native';
import Config from 'react-native-config';
import {Connections, getUserId, initConnection, initTerra} from 'terra-react';

const devId = Config.DEV_ID;
const apiKey = Config.API_KEY;

const REF_ID = '221f44ad-fdc3-4790-8c14-420fd4e72f36';

type TGenerateAuthTokenResponse = {
  status: string;
  token: string;
  expires_in: number;
};

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeSdk = async () => {
    const result = await initTerra(devId, REF_ID);

    if (result.error) {
      Alert.alert('Failed to initialize sdk');
      setIsInitialized(false);
    } else {
      setIsInitialized(true);
    }
  };

  const generateAuthToken = async () => {
    const response = await fetch(
      'https://api.tryterra.co/v2/auth/generateAuthToken',
      {
        method: 'POST',
        headers: {
          'dev-id': devId,
          'x-api-key': apiKey,
        },
      },
    );

    const {token} = (await response.json()) as TGenerateAuthTokenResponse;
    console.log('token', token);

    return token;
  };

  const initializeConnection = async () => {
    try {
      // Example token received from your backend
      const token = await generateAuthToken();

      // Define connection type and custom permissions
      const connection = Connections.APPLE_HEALTH;
      const schedulerOn = true; // Enables background delivery

      // Initialize the connection
      const successMessage = await initConnection(
        connection,
        token,
        schedulerOn,
        [],
      );
      if (successMessage.error !== null) {
        console.log('Error initialising a connection');
      }
    } catch (error) {
      console.log('Error initialising a connection');
    }
  };

  const checkIsConnected = async () => {
    const result = await getUserId(Connections.APPLE_HEALTH);
    if (result.userId) {
      Alert.alert(`User is connected: ${result.userId}`);
    } else {
      Alert.alert('User is not connected');
    }
  };

  const deauthorizeIntegration = async () => {
    const userId = (await getUserId(Connections.APPLE_HEALTH)).userId;
    if (!userId) {
      Alert.alert('User is not connected');
      return;
    }
    try {
      const response = await fetch(
        `https://api.tryterra.co/v2/auth/deauthenticateUser?user_id=${userId}`,
        {
          method: 'DELETE',
          headers: {
            'dev-id': devId,
            'x-api-key': apiKey,
          },
        },
      );
      const json = await response.json();
      Alert.alert(`deauthenticateUser response: ${JSON.stringify(json)}`);
    } catch (error) {
      console.log('Error deauthorizing integration');
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.screen}>
        <Button title="Initialize SDK" onPress={initializeSdk} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Button title="Initialize Connection" onPress={initializeConnection} />
      <Button title="Check is connected" onPress={checkIsConnected} />
      <Button title="Remove connection" onPress={deauthorizeIntegration} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
