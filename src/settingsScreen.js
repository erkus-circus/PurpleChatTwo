import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { purpleBackground } from "../styles";

export function SettingsScreen({ navigation, route }) {
    return (
        <SafeAreaView style={{backgroundColor:purpleBackground, flex: 1}}>
            <Button title="Log out" onPress={() => {
                AsyncStorage.multiRemove(["userID", "password"]).then(()=> {
                    navigation.reset({
                        index: 0,
                        routes: [{name: "Login"}]
                    })
                })
            }} />
        </SafeAreaView>
    )
}