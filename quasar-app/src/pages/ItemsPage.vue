<template>
  <q-page class="q-pa-md flex flex-center">
    <div>
      <q-table
        flat
        bordered
        :rows="items"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :loading="loading"
        :filter="filter"
        binary-state-sort
        @request="searchQuery"
      >
        <template v-slot:top-right>
          <q-input dense v-model="filter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script>
import { ref, watch } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const GET_ITEMS = gql`
  query GetItems($limit: Int, $offset: Int, $search: String) {
    items(limit: $limit, offset: $offset, search: $search) {
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
  setup() {
    const limit = ref(10);
    const offset = ref(0);
    const filter = ref('');
    const items = ref([]);
    const pagination = ref({
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
    });

    const { result, loading, error, refetch } = useQuery(GET_ITEMS, {
      variables: {
        limit: limit.value,
        offset: offset.value,
        search: filter.value,
      },
    });

    watch(result, (newResult) => {
      if (newResult && newResult.items) {
        if (offset.value === 0) {
          items.value = newResult.items;
        } else {
          items.value.push(...newResult.items);
        }
        pagination.value.rowsNumber = items.value.length;
      }
    });

    function searchQuery(props) {
      const { page, rowsPerPage, rowsNumber } = props.pagination;
      const filter = props.filter;

      offset.value = (page - 1) * rowsPerPage;
      limit.value = rowsPerPage;

      refetch({
        limit: limit.value,
        offset: offset.value,
        search: filter,
      }).catch((error) => console.error('Refetch error:', error));
    }

    const { mutate } = useMutation(ADD_ITEM, {
      onCompleted: () => {
        offset.value = 0;
        refetch().catch((error) => console.error('Mutation refetch error:', error));
      },
    });

    const name = ref('');
    const manufacturer = ref('');

    const handleAddItem = () => {
      if (name.value && manufacturer.value) {
        mutate({
          variables: {
            name: name.value,
            manufacturer: manufacturer.value,
          },
        }).catch((error) => {
          console.error('Error adding item:', error);
        });
        name.value = '';
        manufacturer.value = '';
      }
    };

    const columns = [
      { name: 'id', align: 'center', label: 'ID', field: 'id', sortable: true },
      { name: 'name', align: 'center', label: 'Name', field: 'name', sortable: true },
      { name: 'manufacturer', align: 'center', label: 'Manufacturer', field: 'manufacturer', sortable: true },
    ];

    return {
      items,
      name,
      manufacturer,
      handleAddItem,
      columns,
      filter,
      searchQuery,
      loading,
      error,
      pagination,
    };
  },
};
</script>
