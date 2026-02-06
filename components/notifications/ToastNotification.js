import { useEffect, useRef } from "react";
import { Animated, PanResponder, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ToastNotification({
    visible,
    message,
    type = "success",
    duration = 2500,
    onHide
}) {
    const translateY = useRef(new Animated.Value(-80)).current;
    const insets = useSafeAreaInsets();
    const dismissedRef = useRef(false);
    const animationRef = useRef(null);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy < -10,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy < 0) translateY.setValue(gestureState.dy);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy < -30) {
                    dismissedRef.current = true;
                    Animated.timing(translateY, {
                        toValue: -80,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(onHide);
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            }
        })
    ).current;

    useEffect(() => {
        if (visible) {
            dismissedRef.current = false;
            translateY.setValue(-80);
            animationRef.current = Animated.sequence([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.delay(duration),
                Animated.timing(translateY, {
                    toValue: -80,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                if (!dismissedRef.current && onHide) onHide();
            });
        }
        return () => {
            if (animationRef.current) animationRef.current.stop();
        };
    }, [visible, duration]);

    const bgColor = type === "error" ? "#EF4444" : "#22C55E";

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={{
                position: "absolute",
                top: insets.top + 4,
                left: 10,
                right: 10,
                zIndex: 1000,
                paddingVertical: 16,
                paddingHorizontal: 24,
                backgroundColor: bgColor,
                borderRadius: 12,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
                transform: [{ translateY }],
                opacity: visible ? 1 : 0,
            }}
        >
            <Text style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: 14,
            }}>
                {message}
            </Text>
        </Animated.View>
    );
}
