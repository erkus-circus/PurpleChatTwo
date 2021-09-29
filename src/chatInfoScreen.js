import React, { useEffect, useState } from "react";
import { Button, FlatList, Text, View } from "react-native";
import { purpleBackground } from "../styles";
import { chatSocket } from "./socketio";
import { clientID } from "./socketio";

export function ChatInfoScreen ({ navigation, route }) {
    const [chatData, setChatData] = useState({})
    
    useEffect(() => {
        chatSocket.on("enrolled-chat", setChatData)
        chatSocket.emit("get-enrolled-chat", route.params.id, clientID.userID, clientID.user)

        return () => {
            chatSocket.off("enrolled-chat", setChatData)
        }
    }, []);

    useEffect(() => {
        navigation.setOptions({title: chatData.name + " info"})
    }, [chatData])
    

    const renderUser = (item) => {
        return (
            <Text style={{color: "white", textAlign: "center"}}>{item.item}</Text>
        )
    }

    return (
        <View style={{backgroundColor: purpleBackground, flex: 1}}>
            {/* leave and add buttons */}
            <View style={{flexDirection: "row", justifyContent: "center"}}>
                <Button color={"red"} title={"Leave"} />
                <Button color={"green"} title={"Add users"} />
            </View>

            <FlatList
            data={chatData.users}
            renderItem={renderUser}
            />
        </View>
    )
}
