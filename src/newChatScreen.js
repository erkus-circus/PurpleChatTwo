import { Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { chatSocket, clientID } from "./socketio";
import { purpleBackground } from "../styles";
import { chatStyles } from "./chatsScreen";

export function NewChatScreen ({ navigation, route }) {
    const [users, setUsers] = useState([])
    const [selectableUsers, setSelectableUsers] = useState([])
    const [selectedUsers, setSelectedUsers] = useState([])
    const [input, setInput] = useState("") 

    useEffect(()=> {
        setSelectableUsers(users.filter((u) => u != clientID.user))
    }, [users])

    const submitCreateChat = (selectedUsers) => {

        if (selectedUsers.length === 0) {
            return;
        }

        chatSocket.emit("create-group-chat", clientID.userID, clientID.user, selectedUsers.concat([clientID.user]), selectedUsers.concat([clientID.user]).sort().join(", "), 1)
    }

    useEffect(()=>{
        chatSocket.on("get-users-res", setUsers)
        chatSocket.emit("get-users", clientID.userID, clientID.user)

        chatSocket.on("create-group-chat-res", (id, name) => {
            console.log(name);
            navigation.goBack();
            navigation.reset({
                index: 1,
                routes: [{ name: 'ChatSelector' }, { name: "ChatScreen", params: { id: id, name: name } }],
              });
        })

        
        
        // called when unmounting;
        return () => {
            chatSocket.off("get-users-res")
            chatSocket.off("create-group-chat-res")
        }
        
    }, [])
    
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => <Button title={"Create"} onPress={() => submitCreateChat(selectedUsers)} />
        })

    }, [selectedUsers])

    const renderSelectableUser = (user) => {

        return (
            <Button color={"lightgreen"} title={user.item} onPress={() => {
                setSelectedUsers(selectedUsers.concat([user.item]))
                setSelectableUsers(selectableUsers.filter((u) => u != user.item))
            }} />
        )
    }
    
    const renderSelectedUser = (user) => {
        return (
            <Button title={user.item} onPress={() => {
                setSelectedUsers(selectedUsers.filter((u) => u != user.item))
                setSelectableUsers(users.filter((user) => {
                    var res = true;
                    for (let i = 0; i < input.length; i++) {
                        res = res && (user.toUpperCase().indexOf(input[i].toUpperCase()) > -1)
                    }
                    return res
                }))
            }} color={"red"} />
        )
    }

    return (
        <View style={{flex: 1, backgroundColor: purpleBackground}}>

            {/* The input for selecting users: */}
            <View style={[chatStyles.keyboardContainer, {height: 30}]}>
                <TextInput autoCorrect={false} autoFocus={true} style={chatStyles.keyboard} onChangeText={(e) => {
                    setInput(e)

                    setSelectableUsers(users.filter((user) => {
                        var res = true;
                        for (let i = 0; i < e.length; i++) {
                            res = res && (user.toUpperCase().indexOf(e[i].toUpperCase()) > -1) && selectedUsers.indexOf(user) === -1 && user != clientID.user
                        }
                        return res
                    }))
                }}  />
            </View>
                
            <View style={{justifyContent: "center", height: "100%"}}>

                <FlatList
                    style={{maxHeight: "50%"}}
                    renderItem={renderSelectableUser}
                    data={selectableUsers}
                    />
                <Text style={{color: "white"}}>Users Being Added:</Text>
                <FlatList 
                    style={{}}
                    renderItem={renderSelectedUser}
                    data={selectedUsers}
                    />
                    
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    textInput: {
        backgroundColor: "white",
        fontSize: 16
    }
})