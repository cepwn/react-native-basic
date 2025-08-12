import { TimeSegment } from "@/components/TimeSegment";
import { theme } from "@/theme";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { getFromStorage, setToStorage } from "@/utils/storage";
import { Duration, intervalToDuration, isBefore } from "date-fns";
import { isDevice } from "expo-device";
import { notificationAsync, NotificationFeedbackType } from "expo-haptics";
import {
  cancelScheduledNotificationAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
} from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

const frequency = 10_000; // 10 seconds

export const COUNTDOWN_STORAGE_KEY = "taskly-countdown";

export type PersistedCoundownState = {
  currentNotificationId?: string;
  completedAt: number[];
};

type CountdownStatus = {
  isOverdue: boolean;
  distance: Duration;
};

export default function CounterScreen() {
  const { width } = useWindowDimensions();
  const confettiRef = useRef<any>(null);
  const [countdownState, setCountdownState] =
    useState<PersistedCoundownState>();
  const [status, setStatus] = useState<CountdownStatus>({
    isOverdue: false,
    distance: {},
  });
  // const [isLoading, setIsLoading] = useState(false);

  const lastCompletedAt = countdownState?.completedAt[0];

  useEffect(() => {
    getFromStorage(COUNTDOWN_STORAGE_KEY).then((persistedState) => {
      setCountdownState(persistedState);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const timestamp = lastCompletedAt
        ? lastCompletedAt + frequency
        : Date.now();
      // if (lastCompletedAt) {
      //   setIsLoading(false);
      // }
      const isOverdue = isBefore(timestamp, Date.now());
      const distance = intervalToDuration(
        isOverdue
          ? { start: timestamp, end: Date.now() }
          : { start: Date.now(), end: timestamp }
      );
      setStatus({ isOverdue, distance });
    }, 1000);
    return () => clearInterval(timer);
  }, [lastCompletedAt]);

  const scheduleNotification = async () => {
    confettiRef?.current?.start();
    notificationAsync(NotificationFeedbackType.Success);
    let pushNotificationId;
    const status = await registerForPushNotificationsAsync();
    if (status === "granted") {
      pushNotificationId = await scheduleNotificationAsync({
        content: { title: "I'm a notification from your app ✉️" },
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: frequency / 1000,
        },
      });
    } else {
      if (isDevice) {
        Alert.alert(
          "Unable to schedule notificaiton",
          "Please enable push notifications in your device settings"
        );
      }
    }
    if (countdownState?.currentNotificationId) {
      await cancelScheduledNotificationAsync(
        countdownState.currentNotificationId
      );
    }
    const newCountdownState = {
      currentNotificationId: pushNotificationId,
      completedAt: countdownState
        ? [Date.now(), ...countdownState.completedAt]
        : [Date.now()],
    };
    setCountdownState(newCountdownState);
    await setToStorage(COUNTDOWN_STORAGE_KEY, newCountdownState);
  };

  // if (isLoading) {
  //   return (
  //     <View style={styles.activityIndicatorContainer}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  return (
    <View style={[styles.container, status.isOverdue && styles.containerLate]}>
      {status.isOverdue ? (
        <Text style={[styles.heading, styles.whiteText]}>Thing overdue by</Text>
      ) : (
        <Text style={styles.heading}>Thing is due in...</Text>
      )}
      <View style={styles.row}>
        <TimeSegment
          unit="Days"
          number={status.distance.days ?? 0}
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
        <TimeSegment
          unit="Hours"
          number={status.distance.hours ?? 0}
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
        <TimeSegment
          unit="Minutes"
          number={status.distance.minutes ?? 0}
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
        <TimeSegment
          unit="Seconds"
          number={status.distance.seconds ?? 0}
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
      </View>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.button}
        onPress={scheduleNotification}
      >
        <Text style={styles.buttonText}>I've done the thing!</Text>
      </TouchableOpacity>
      <ConfettiCannon
        ref={confettiRef}
        count={50}
        origin={{ x: width / 2, y: -20 }}
        fadeOut
        autoStart={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  containerLate: {
    backgroundColor: theme.colors.colorRed,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    marginBottom: 24,
  },
  button: {
    backgroundColor: theme.colors.colorBlack,
    padding: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: theme.colors.colorWhite,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  text: {
    fontSize: 24,
  },
  whiteText: {
    color: theme.colors.colorWhite,
  },
  activityIndicatorContainer: {
    backgroundColor: theme.colors.colorWhite,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});
