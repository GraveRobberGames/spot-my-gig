import React, {useMemo} from "react";
import {View, Text, Pressable} from "react-native";
import {MaterialCommunityIcons} from "@expo/vector-icons";

function StepNode({active, completed, label, canPress, onPress}) {
    return (
        <Pressable
            onPress={() => {
                if (!canPress) {
                    return;
                }
                onPress();
            }}
            className="items-center"
            style={{width: 64, opacity: canPress ? 1 : 0.65}}
        >
            <View className="relative">
                {active && <View className="absolute inset-0 rounded-full bg-primary-5/55 blur-md" />}

                <View
                    className={`h-9 w-9 rounded-full items-center justify-center border ${
                        active
                            ? "border-primary-5/55 bg-primary-5/15"
                            : completed
                                ? "border-white/18 bg-white/5"
                                : "border-white/10 bg-black/20"
                    }`}
                >
                    {completed ? (
                        <MaterialCommunityIcons name="check" size={16} color="white" />
                    ) : (
                        <View className={`h-2.5 w-2.5 rounded-full ${active ? "bg-primary-5" : "bg-white/35"}`} />
                    )}
                </View>
            </View>

            {!!label && (
                <Text
                    numberOfLines={1}
                    className={`text-[11px] mt-2 font-semibold ${
                        active ? "text-white/85" : "text-white/45"
                    }`}
                >
                    {label}
                </Text>
            )}
        </Pressable>
    );
}

export default function ProfileProgressBar({
                                               steps,
                                               currentStepKey,
                                               completedSteps,
                                               onGoToStep,
                                               labelsByKey,
                                               disabledKeys = [],
                                           }) {
    const currentIndex = useMemo(() => {
        return Math.max(0, steps.indexOf(currentStepKey));
    }, [steps, currentStepKey]);

    return (
        <View className="px-6 pt-3 pb-2">
            <View className="relative">
                <View className="absolute left-0 right-0 top-[18px] h-[2px] bg-white/10 rounded-full" />

                <View className="flex-row items-start justify-between">
                    {steps.map((stepKey, idx) => {
                        const active = stepKey === currentStepKey;
                        const completed = (completedSteps || []).includes(stepKey) || idx < currentIndex;
                        const label = labelsByKey?.[stepKey] || null;

                        const isDisabled = disabledKeys.includes(stepKey);
                        const canPress = !isDisabled && !!onGoToStep && (completed || active);

                        return (
                            <StepNode
                                key={stepKey}
                                active={active}
                                completed={completed}
                                label={label}
                                canPress={canPress}
                                onPress={() => {
                                    if (!canPress) {
                                        return;
                                    }
                                    onGoToStep(stepKey);
                                }}
                            />
                        );
                    })}
                </View>
            </View>
        </View>
    );
}
