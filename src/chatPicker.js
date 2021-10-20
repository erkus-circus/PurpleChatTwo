import { useNavigation } from "@react-navigation/core";
import React, { useState } from "react";
import { Button, FlatList, View, StyleSheet, RefreshControl, StatusBar, Text, Vibration } from "react-native";
import { chatSocket, clientID, socket } from "./socketio";

import "../styles"
import { purpleBackground } from "../styles";

function ChatButton (props) {
    const navigation = useNavigation()

    // console.log(props.data.name + " -- " + props.data.viewed);

    return (
        <Button title={props.data.name} onPress={() => {
            navigation.navigate("ChatScreen", props.data);
            chatSocket.emit("viewed-chat", props.data.id, clientID.userID, clientID.user)
            props.onClickedChat(props.data.id)
        }} color={props.data.viewed ? "white" : "pink"} />
    )
}



export class chatSelectScreen extends React.Component {
    constructor (props) {
        super(props)
        this.props = props;
        this.state = {
            enrolledChats: [],
            updateChats: false,
            currentChat: "",
            refreshing: true,
        }
    }

    renderChatButton ({ item }) {
        return (
            // all of the chat properties
            <ChatButton data={item} onClickedChat={this.handleClickedChat.bind(this)} />
        )
    }

    onRefresh() {
        this.setState({ refreshing: true })
        chatSocket.emit("get-enrolled-chats", clientID.userID, clientID.user)
    }

    render () {
        return (
            <View style={{backgroundColor:purpleBackground, flex: 1}}>
                <StatusBar barStyle={"light-content"} animated={true} />

                <FlatList
                refreshControl={
                    <RefreshControl
                    colors={["white"]}
                    tintColor={"white"}
                    refreshing={this.state.refreshing}
                    onRefresh={this.onRefresh.bind(this)}
                    />
                  }
                data={this.state.enrolledChats} renderItem={this.renderChatButton.bind(this)} extraData={ this.state } />

            </View>
        )
    }

    handleClickedChat(id) {
        this.state.enrolledChats[this.state.enrolledChats.map((value) => value.id).indexOf(id)].viewed = true;
        this.setState({ currentChat: id, enrolledChats: this.state.enrolledChats});
    }

    componentDidMount () {

        this.props.navigation.addListener("focus", () => {
            this.setState({currentChat: ""})
        })

        chatSocket.emit("get-enrolled-chats", clientID.userID, clientID.user)

        this.props.navigation.setOptions({ title: clientID.user + "\'s chats" })

        chatSocket.on("enrolled-chats",
        /**
         *  
         * @param {Array} chats 
         */
        (chats) => {
            this.setState({ enrolledChats: chats.sort((a, b) => b.lastUpdated - a.lastUpdated), refreshing: false })
        })

        // when a grouochat is renamed
        chatSocket.on("rename-chat", (id, newName) => {

            this.state.enrolledChats[this.state.enrolledChats.map((item) => item.id).indexOf(id)].name = newName;
            this.setState({ enrolledChats: this.state.enrolledChats })
        })

        chatSocket.on("chat-message", this.onChatMessageBound)

        chatSocket.on("new-groupchat", () => {
            // TODO: this is a super inneficient way of creating new groupchats
            chatSocket.emit("get-enrolled-chats", clientID.userID, clientID.user)
        });
    }

    onChatMessage (message) {
        if (message.to === this.state.currentChat) {
            Vibration.vibrate([0, 10000, 5000, 10000])
            return
        };
        
        // mightg not always work
        // not sure if i ever fixed this,

        var index = this.state.enrolledChats.map((value) => value.id).indexOf(message.to)
        if (index > 0 && message.to) {

            var oldChat = this.state.enrolledChats.splice(index, 1)

            Object.assign(oldChat[0], {
                viewed: oldChat[0].id === this.state.currentChat,
                lastUpdated: message.time
            })

            this.setState({
                enrolledChats: oldChat.concat(this.state.enrolledChats)
            })
        } else {
            chatSocket.emit("get-enrolled-chats", clientID.userID, clientID.user)
        }
    }
    onChatMessageBound = this.onChatMessage.bind(this)

    componentWillUnmount() {
        chatSocket.off("enrolled-chats")
        chatSocket.off("new-groupchat")
        chatSocket.off("rename-chat")
        chatSocket.off("chat-message", this.onChatMessageBound)
    }
}



const styles = StyleSheet.create({
    unread: {
        backgroundColor: "pink",
        color: "orange"
    }
})
