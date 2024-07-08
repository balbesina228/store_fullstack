<template>
  <div>
    <h1>Items</h1>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }} - {{ item.manufacturer }}</li>
    </ul>
    <input v-model="name" placeholder="Name" />
    <input v-model="manufacturer" placeholder="Manufacturer" />
    <button @click="addItem">Add Item</button>
    <div v-if="loading">Loading...</div>
    <div v-if="error">Error: {{ error.message }}</div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const GET_ITEMS = gql`
  query GetItems {
    items {
      id
      name
      manufacturer
    }
  }
`;

const ADD_ITEM = gql`
  mutation AddItem($name: String!, $manufacturer: String!) {
    createItem(name: $name, manufacturer: $manufacturer) {
      id
      name
      manufacturer
    }
  }
`;

export default {
  name: 'ItemsPage',
  setup() {
    const { loading, error, result } = useQuery(GET_ITEMS);
    const addItemMutation = useMutation(ADD_ITEM, {
      refetchQueries: [{ query: GET_ITEMS }]
    });

    const name = ref('');
    const manufacturer = ref('');
    const items = ref([]);

    watch(result, () => {
      if (result.value) {
        items.value = result.value.items;
      }
    });

    const addItem = async () => {
      if (name.value && manufacturer.value) {
        try {
          await addItemMutation({
            variables: {
              name: name.value,
              manufacturer: manufacturer.value
            }
          });
          name.value = '';
          manufacturer.value = '';
        } catch (err) {
          console.error("Error adding item:", err);
        }
      }
    };

    return {
      loading,
      error,
      items,
      name,
      manufacturer,
      addItem
    };
  }
};
</script>
