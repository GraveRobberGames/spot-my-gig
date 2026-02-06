import React, {useEffect, useRef} from "react";
import {View, Animated} from "react-native";

export default function Loader() {
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(scale, {toValue: 1.2, duration: 500, useNativeDriver: true}),
                Animated.timing(scale, {toValue: 1, duration: 500, useNativeDriver: true}),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);

    return (
        <View style={{alignItems: "center", justifyContent: "center"}}>
            <Animated.Image
                source={require("../../../assets/images/logo.png")}
                style={{
                    width: 280,
                    height: 280,
                    transform: [{scale}],
                }}
                resizeMode="contain"
            />
        </View>
    );
}
