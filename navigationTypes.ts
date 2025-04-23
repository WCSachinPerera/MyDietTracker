import { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  Tabs: undefined;
  CalorieCountStack: NavigatorScreenParams<CalorieStackParamList>;
};

export type CalorieStackParamList = {
  calorieCountStep1: undefined;
  calorieCountStep2: undefined;
  calorieCountStep3: undefined;
};
