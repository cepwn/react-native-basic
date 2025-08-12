import { theme } from "@/theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ShoppingListItemProps = {
  name: string;
  isCompleted?: boolean;
  onDelete: () => void;
  onToggleComplete: () => void;
};

export default function ShoppingListItem({
  name,
  isCompleted,
  onDelete,
  onToggleComplete,
}: ShoppingListItemProps) {
  const handleDelete = () => {
    Alert.alert(
      `Are you sure you want to delete ${name}?`,
      "It will be removed from the list.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: onDelete,
          style: "destructive",
        },
      ]
    );
  };

  return (
    <Pressable
      style={[styles.itemContainer, isCompleted && styles.completedContainer]}
      onPress={onToggleComplete}
    >
      <View style={styles.row}>
        <FontAwesome
          name={isCompleted ? "check-square-o" : "square-o"}
          size={24}
          color={isCompleted ? theme.colors.colorGrey : theme.colors.colorBlack}
        />
        <Text
          style={[styles.itemText, isCompleted && styles.completedText]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>
      <TouchableOpacity activeOpacity={0.8} onPress={handleDelete}>
        <AntDesign
          name="closecircle"
          size={24}
          color={isCompleted ? theme.colors.colorGrey : theme.colors.colorRed}
        />
      </TouchableOpacity>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomColor: theme.colors.colorCerulean,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.colorWhite,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  completedContainer: {
    backgroundColor: theme.colors.colorLightGrey,
    borderBottomColor: theme.colors.colorLightGrey,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: theme.colors.colorGrey,
  },
  itemText: {
    fontSize: 18,
    fontWeight: "200",
    flex: 1,
  },
});
