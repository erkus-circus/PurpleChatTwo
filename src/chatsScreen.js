import { StatusBar, unstable_enableLogBox } from "react-native"
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, Button } from 'react-native';
import { chatSocket, clientID } from './socketio';
import './socketio'
import { purpleBackground } from '../styles';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from "@react-navigation/core";


const styles = StyleSheet.create({
    timeText: {
        fontSize: 11,
        color: "gray"
    },
    senderText: {
        color: "rgb(119, 190, 119)"
    },

    adminSenderText: {
        color: "red"
    },
    messageText: {
        color: "rgb(106, 154, 172)"
    },
    messageContainer: {
        padding: 8,
        flexDirection: "row",
        fontSize: 15
    },  

    keyboardContainer: {
        marginLeft: 10,
        marginBottom: 30,
        // flex: 1,
        backgroundColor: "transparent",
        marginRight: 10,
    },
    keyboard: {
        borderRadius: 8,
        color: "white",
        overflow: "visible",
        paddingLeft: 6,
        backgroundColor: "purple",
    },
    content: {
        // paddingTop: 50,
        padding: 0,
        margin: 0,
        justifyContent: "center",
        alignItems: "stretch",
        flex: 1,
    },
    background: {
        backgroundColor: purpleBackground,
        justifyContent: "center",
        height: "100%"
    },
    white: {
        color: "#fff",
        padding: 6,
        flex: 1,
    },
    container: {
        flex: 1,
        //marginTop: 40,
        color: "white",
    },
    hidden: {
        position: "absolute",
        top: 1000,
        left: 1000
    },
});

// 
const CustomTextInput = (props) => {
    const [text, setText] = useState("");
    const [height, setHeight] = useState(25);
    
    return (
        <View style={[styles.keyboardContainer, {height: height}]}>
            <TextInput
            value={text}
            blurOnSubmit={false}
            style={[styles.keyboard, {height: height}]}
            onChangeText={(text)=>{
                setText(text)
            }}
            // multiline
            // enablesReturnKeyAutomatically={true}
            returnKeyType='done'
            onSubmitEditing={(e)=>{
                if (!e.nativeEvent.text.trim().length) {
                    return
                }
                chatSocket.emit("sent-message", props.id, {
                    message: e.nativeEvent.text,
                    media: [],
                    userID: clientID.userID,
                    sender: clientID.user,
                    to: props.id,
                    time: new Date().getTime()
                })
                setText("")
            }}
            />
            <Text style={styles.hidden} onLayout={(e)=>{
                var h = e.nativeEvent.layout.height;
                h = h >= 25 ? h : 25
                setHeight(h)
            }}>{text}</Text>
        </View>
    )
}

class Chat extends React.PureComponent {
    constructor(props) {
        super(props)
        this.props = props;
    }

    render() {

        var style = "senderText"
        if (this.props.sender == "Admin") {
            style = "adminSenderText"
        }
    
        return (
            <View style={styles.messageContainer}>
                {/* <Text style={styles.timeText}>{new Date(props.time).toLocaleString()}: </Text> */}
                <Text style={styles[style]}>&lt;{this.props.sender}&gt;</Text>
                <Text style={styles.messageText}> {this.props.message}</Text>
            </View>
        )
    }
}

class Chats extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            toScroll: 0,
            scrollToEnd: true,
            scrollToTop: false,
            chats: [],

            // for listeners:
        }
        this.props = props;
        
    }

    loadMessageRes(messages) {
        // console.log(this.state.chats.length);
        if (this.state.chats.length === 0) {
            this.setState({ chats: messages.concat(this.state.chats), scrollToEnd: true})
            setTimeout(()=>{
                this.setState({scrollToEnd: true});
            }, 5000)
        } else {
            this.setState({ chats: messages.concat(this.state.chats), scrollToTop: true })
        }
    }

    onChatMessage(message) {
        // console.log(message.to == this.props.data.id);
        if (message.to != this.props.data.id) {
            return;
        }

        this.setState({ chats: this.state.chats.concat([message]), scrollToEnd: true })
    }

    componentWillUnmount() {
        chatSocket.off("load-messages-count-res", this.loadMessageRes.bind(this))
        chatSocket.off("chat-message", this.onChatMessage.bind(this))

        this.setState({ toScroll: 1, chats: [] })
        // console.log("unmounting");
    }

    componentDidMount() {
        // console.log(this.props.data);
        chatSocket.on("load-messages-count-res", this.loadMessageRes.bind(this))

        chatSocket.on("chat-message", this.onChatMessage.bind(this))
        this.loadMoreChats("scrollEnd")
        // console.log("mounted");


    } 

    loadMoreChats(e) {
        if(e == "scrollEnd" || e.nativeEvent.contentOffset.y < 10) {
            
            // true means load in backwards.
            chatSocket.emit("load-messages-count", this.props.data.id, clientID.userID, clientID.user, this.state.toScroll, (this.state.toScroll + 100), true)

            this.setState({toScroll: this.state.toScroll + 100, scrollToEnd: e == "scrollEnd"})
        }
    }

    render() {
        return (
            <FlatList
            onScrollEndDrag={this.loadMoreChats.bind(this)}
            data={this.state.chats}
            renderItem={(chat)=> {
                return <Chat sender={chat.item.sender} time={chat.item.time} message={chat.item.message} />
            }}
            keyExtractor={(item, index)=>index}
            ref={ref => {this.scrollView = ref}}
            onContentSizeChange={()=>{
                // console.log(this.state.scrollToEnd);
                if (this.state.scrollToEnd) {
                    this.scrollView.scrollToEnd({animated: false})
                    setTimeout(()=>this.scrollView.scrollToEnd(), 150)
                } else if (this.state.scrollToTop) {
                    this.scrollView.scrollToIndex({index: 0, animated: false});
                }
                this.setState({ scrollToEnd: false, scrollToTop: false })
            }}
            />
        )
    }
}

export const ChatScreen = (props) => {

    const navigation = useNavigation()
    
    useEffect(()=> {    
        navigation.setOptions({ title: props.route.params.name })

        chatSocket.on("rename-chat", (id, newName) => {
        navigation.setOptions({ title: id == props.route.params.id ? newName : props.route.params.name })

        })

    }, []);

    return (
        <View style={styles.background}>
            <StatusBar barStyle={"light-content"} animated={true} />

            {/* <Button style={styles.settingsButton} title="Logout" onPress={ ()=> navigation.navigate("Login") }/> */}

            <KeyboardAvoidingView
                keyboardVerticalOffset={useHeaderHeight() } style={styles.content} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <View style={styles.container}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <Chats data={props.route.params} />
                    </TouchableWithoutFeedback>
                </View>
                <CustomTextInput id={props.route.params.id} />
            </KeyboardAvoidingView>

        </View>
    )
}
