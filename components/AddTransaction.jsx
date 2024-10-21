import NetInfo from "@react-native-community/netinfo";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db } from "../firebase.config.js";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import CameraComponent from "./CameraComponent.jsx";

export const AddTransaction = ({ onHideAddNew, onAddTransaction }) => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setShowDatePicker(false);
  };

  const allowOnlyNumbers = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setAmount(numericValue);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    if (!amount || isNaN(amount) || amount <= 0) {
      isValid = false;
      newErrors.amount = "Please enter a valid amount";
    }
    if (!category) {
      isValid = false;
      newErrors.category = "Category cannot be empty";
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSaveTransaction = async () => {
    setLoading(true);
    const collectionRef = collection(db, "transactions");
    const newTransaction = {
      date: date,
      amount: +amount,
      category,
      description,
      imageUri,
    };

    const state = await NetInfo.fetch();
    if (state.isConnected) {
      try {
        const docRef = await addDoc(collectionRef, newTransaction);
        onAddTransaction({ id: docRef.id, ...newTransaction });
        setLoading(false);
        handleCancel();
      } catch (err) {
        console.error("Error saving transaction to Firestore:", err);
        setLoading(false);
        handleCancel();
      }
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      handleSaveTransaction();
    }
  };

  const handleCancel = () => {
    setDate(new Date());
    setAmount("");
    setCategory("");
    setDescription("");
    setErrors({});
    setImageUri(null);
    onHideAddNew(true);
  };

  const handleImageCapture = (uri) => {
    setImageUri(uri);
    setShowCamera(false);
  };

  return (
    <View style={styles.formContainer}>
      {showCamera ? (
        <CameraComponent onPhotoTaken={handleImageCapture} />
      ) : (
        <>
          <Text style={styles.label}>Add Transaction</Text>

          <View style={styles.innerContainer}>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={styles.input}
            >
              <Text>{date.toDateString()}</Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={allowOnlyNumbers}
            />
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount}</Text>
            )}

            <Picker
              selectedValue={category}
              style={styles.input}
              onValueChange={(itemValue) => setCategory(itemValue)}
            >
              <Picker.Item label="Food" value="Food" />
              <Picker.Item label="Transport" value="Transport" />
              <Picker.Item label="Entertainment" value="Entertainment" />
            </Picker>
            {errors.category && (
              <Text style={styles.errorText}>{errors.category}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
            />

            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 100, height: 100, marginVertical: 10 }}
              />
            ) : (
              <Pressable
                onPress={() => setShowCamera(true)}
                style={styles.cameraButton}
              >
                <Text style={{ color: "blue" }}>Capture Image</Text>
              </Pressable>
            )}
          </View>

          {loading && (
            <View>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}

          {!loading && (
            <View style={styles.buttonContainer}>
              <Pressable onPress={handleSubmit}>
                <Text
                  style={{ fontWeight: "bold", color: "blue", fontSize: 20 }}
                >
                  Save
                </Text>
              </Pressable>
              <Pressable onPress={handleCancel}>
                <Text style={{ fontWeight: "bold", fontSize: 20 }}>Cancel</Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    borderWidth: 2,
    borderColor: "#2196F3",
    borderRadius: 10,
    padding: 30,
    margin: 10,
    backgroundColor: "white",
    minHeight: 300,
  },
  innerContainer: {
    flexGrow: 1,
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    justifyContent: "center",
    borderRadius: 5,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginHorizontal: 20,
  },
  cameraButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
});

export default AddTransaction;
