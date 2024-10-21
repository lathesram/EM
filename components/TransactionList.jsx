import React from "react";
import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import moment from "moment";

export const TransactionList = ({ transactions }) => {
  const formatDate = (transactionDate) => {
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "days").startOf("day");
    const date = moment(transactionDate, "YYYY-MM-DD");

    if (date.isSame(today, "d")) {
      return "Today";
    } else if (date.isSame(yesterday, "d")) {
      return "Yesterday";
    } else {
      return date.format("DD MMM YYYY");
    }
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionRow}>
      <View>
        <Text style={{ fontWeight: "bold" }}>{item.category}</Text>
        <Text>{item.description}</Text>
      </View>
      <Text style={{ fontWeight: "bold" }}>{item.amount}</Text>
    </View>
  );

  const renderDateSection = (date, data) => (
    <View key={date}>
      <Text style={styles.dateHeader}>{date}</Text>
      <FlatList
        data={data}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
      />
      <View style={styles.divider} />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {Object.keys(transactions)
      .sort((a, b) => moment(b).diff(moment(a)))
      .map((date) =>
        renderDateSection(formatDate(date), transactions[date])
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginRight: 20,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginRight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
});

export default TransactionList;
