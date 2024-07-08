<template>
  <div>
    <h1>Items</h1>
    <ul>
      <li v-for="item in items" :key="item.id">({{ item.id }}) {{ item.name }} - {{ item.manufacturer }}</li>
    </ul>
    <form>
      <input v-model="name" placeholder="Name" />
      <input v-model="manufacturer" placeholder="Manufacturer" />
    <button @click="handleAddItem">Add Item</button>
    </form>
  </div>
</template>

<script>
import { ref, watchEffect } from 'vue';
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
  mutation addItem($name: String!, $manufacturer: String!) {
    createItem(name: $name, manufacturer: $manufacturer) {
      id
      name
      manufacturer
    }
  }
`;

export default {
  setup() {
    const { result, refetch } = useQuery(GET_ITEMS);
    const name = ref('');
    const manufacturer = ref('');
    const { mutate } = useMutation(ADD_ITEM, {
      onCompleted: () => {
        refetch();
      },
    });


    const items = ref([]);

    watchEffect(() => {
      if (result.value) {
        items.value = result.value.items;
      }
    });

    const handleAddItem = async () => {
      if (name.value && manufacturer.value) {
        mutate({ name: name.value, manufacturer: manufacturer.value });
        name.value = '';
        manufacturer.value = '';
      }
    };

    return {
      items,
      name,
      manufacturer,
      handleAddItem
    };
  }
};
</script>
