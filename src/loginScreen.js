import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableWithoutFeedback, Keyboard, Button, SegmentedControlIOSBase, StatusBar } from 'react-native';
import { accountSocket, clientID, setClientID } from './socketio';
import "./socketio"
import { purpleBackground } from '../styles';

import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: purpleBackground,
        justifyContent: "flex-start",
        alignContent: "space-around"
    },
    input: {
        // flex: 1,
        margin: 20,
        padding: 5,
        borderRadius: 6,
        backgroundColor: "white"
    },
    label: {
        // flex: 1.
        color: "white"
    },
    errorMessage: {
        color: "red",
        textAlign: "center",
        margin: 12,
    },
    buttons: {
        // flex: 1,
        flexDirection: "row",
        marginTop: 60,
        justifyContent: "center"
    },
    button: {

    }
})

export class LoginScreen extends React.Component {
    constructor(props) {
        super(props)
        this.props = props;
        
        this.state = {
            username: "",
            password: "",
            errorMessage: "",
            color: "white"
        }
        
    }
    // TODO: on unmount remove the socket updates.
    loginSubmit() {
        this.setState({errorMessage: "Logging in. Please Wait.", color: "white"})
        accountSocket.emit("auth-user", this.state.username, this.state.password)
    }

    async componentDidMount() {
        accountSocket.on("auth-user-res", async (res)=>{
            if(res) {
                // store things
                await AsyncStorage.setItem("userID", res.userID);
                await AsyncStorage.setItem("username", res.user)
                await AsyncStorage.setItem("password", this.state.password)
                
                // set the clientID
                setClientID(res)
                // go to chats screen
                this.props.navigation.replace("ChatSelector")
            } else {
                this.setState({ errorMessage: "Error logging in. Check username and password.", color: "red" })
            }
        });

        AsyncStorage.multiGet(["username", "password", "userID"], (errs, res) => {
            // get all the stored keys
            const username = res[0][1],
                  password = res[1][1],
                  userID = res[2][1];
                
            if (username) {
                // the username exists, set it in state
                this.setState({ username: username })
            }
            if (password) {
                this.setState({password: password});
            }

            if (username && userID) {
                // check to see if it is stored correctly
                fetch("https://lucid-detroit.com/isAuth/" + userID + "?user=" + username).then((value) => {
                    if (value.ok) {
                        // the userID is still valid, go to chats screen
                        setClientID({ user: username, userID })
                        this.props.navigation.replace("ChatSelector")
                    } else if (username && password) {
                        // try logging the user in, userID is there but expireds
                        this.loginSubmit()
                    }
                })
            }
        })
    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <StatusBar barStyle={"dark-content"} animated={true} />
                    <Text style={[styles.errorMessage, {color: this.state.color}]}>{this.state.errorMessage}</Text>
                    <Text style={styles.label} >Username: </Text>
                    <TextInput style={styles.input} onChangeText={(text)=>this.setState({username: text})} value={this.state.username} autoCorrect={false} autoCapitalize={"none"} />
                    <Text style={styles.label} >Password: </Text>
                    <TextInput style={styles.input} onChangeText={(text)=>this.setState({password: text})} value={this.state.password} onSubmitEditing={this.loginSubmit.bind(this)} blurOnSubmit secureTextEntry />
        
                    <View style={styles.buttons}>
                        {/* <Button title="Register" onPress={()=>this.props.navigation.navigate("Register")}></Button> */}
                        <Button title="Login" onPress={this.loginSubmit.bind(this)}></Button>
                    </View>
                </View>   
            </TouchableWithoutFeedback>
        )
    }
}
