import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  ActivityIndicator,
} from "react-native";
import { TransactionList } from "../components/TransactionList.jsx";
import { AddTransaction } from "../components/AddTransaction.jsx";

import { db } from "../firebase.config.js";
import { collection, getDocs, Timestamp, addDoc } from "firebase/firestore";
import NetInfo from "@react-native-community/netinfo";

export interface ITransaction {
  id?: string;
  category: string;
  description?: string;
  amount: number;
  date: Timestamp | Date;
}

interface TransactionsByDate {
  [date: string]: ITransaction[];
}

const HomeScreen = () => {
  const [transactions, setTransactions] = useState<TransactionsByDate>({});
  const [showAddNew, setShowAddNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const fetchTransactions = async () => {
    try {
      const collectionRef = collection(db, "transactions");
      const snapshot = await getDocs(collectionRef);
      const fetchedData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as ITransaction),
      }));
      setLoading(false);
      return fetchedData;
    } catch (error) {
      setLoading(false);
      console.error("Error fetching transactions:", error);
    }
  };

  const transformData = (data: ITransaction[]) => {
    const groupedByDate = data.reduce(
      (grouped: { [key: string]: ITransaction[] }, transaction) => {
        let dateString: string = "null";
        if (transaction.date instanceof Timestamp) {
          dateString = new Timestamp(
            transaction.date.seconds,
            transaction.date.nanoseconds
          )
            .toDate()
            .toISOString()
            .split("T")[0];
        } else if (transaction.date instanceof Date) {
          dateString = transaction.date.toISOString().split("T")[0];
        } else {
          console.error("Invalid date format:", transaction.date);
        }

        if (!grouped[dateString]) {
          grouped[dateString] = [];
        }
        grouped[dateString].push(transaction);
        return grouped;
      },
      {}
    );
    return groupedByDate;
  };

  const fetchData = async () => {
    setLoading(true);
    const fetchedData = await fetchTransactions();
    const transformedData = transformData(fetchedData as ITransaction[]);
    setTransactions(transformedData);
  };

  const addNewTransaction = (newTransaction: ITransaction) => {
    const date = new Date(newTransaction.date.toString())
      .toISOString()
      .split("T")[0];
    setTransactions((prevTransactions) => ({
      ...prevTransactions,
      [date]: [...(prevTransactions[date] || []), newTransaction],
    }));
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, [isConnected]);

  const updateShowAddNew = () => {
    setShowAddNew((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      {!isConnected && <Text style={styles.noNetwork}>No Network</Text>}

      {loading && isConnected && (
        <View>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      {!showAddNew && (
        <View style={styles.container}>
          <TransactionList transactions={transactions} />
          <Pressable style={styles.addButton} onPress={updateShowAddNew}>
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>
      )}

      {showAddNew && (
        <View style={styles.container}>
          <AddTransaction
            onHideAddNew={updateShowAddNew}
            onAddTransaction={addNewTransaction}
          ></AddTransaction>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    margin: 5,
  },
  addButton: {
    backgroundColor: "#2196F3",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 30,
    right: "43%",
  },
  addButtonText: {
    fontSize: 30,
    color: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  noNetwork: {
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "red",
  },
});

export default HomeScreen;
