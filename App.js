import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { chatSocket } from './src/socketio';
import { ChatScreen } from './src/chatsScreen';
// import { SettingsScreen } from './src/settingsScreen';
import { purpleBackground } from './styles';
import { LoginScreen } from './src/loginScreen';
import { chatSelectScreen } from './src/chatPicker';
import { Button } from 'react-native';
import { SettingsScreen } from './src/settingsScreen';
import { NewChatScreen } from './src/newChatScreen';
import { ChatInfoScreen } from './src/chatInfoScreen';
// import { RegisterScreen } from './src/registerScreen';
// import { chatListScreen } from './src/chatListScreen';

const Stack = createNativeStackNavigator();

/*
<message>
    time: sender: message
*/



const App = () => {
    useEffect(() => {

        chatSocket.on("connect", () => {
            console.log("c");
        })
        chatSocket.on("disconnect", () => {
            console.log("d");
        })

        chatSocket.on('connect_error', (err) => {
            console.log(err)
        })


        return () => {
            // socket.disconnect()
        }
    }, []);

    const [users, setUsers] = useState([])

    return (

        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: purpleBackground,
                    },
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        color: 'gray'
                    },
                }} >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="ChatScreen" component={ChatScreen} />

                <Stack.Screen name="ChatSelector" component={chatSelectScreen} options={({ navigation, route }) => ({
                    headerLeft: props => <Button title="Settings" onPress={() => navigation.navigate("Settings")} />,
                    headerRight: props => <Button title="New Chat" onPress={() => navigation.navigate({
                        name: "New Chat",
                        params: { users: users }
                    })} />
                })} />

                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="New Chat" component={NewChatScreen} />
                <Stack.Screen name="Chat Info" component={ChatInfoScreen} options={{
                    presentation: "modal",
                }} />
            </Stack.Navigator>

        </NavigationContainer>

    );
}

export default App;