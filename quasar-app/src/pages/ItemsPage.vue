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
        v-model:selected="selectedItems"
        selection="multiple"
      >
        <template v-slot:top-right>
          <q-input dense v-model="filter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:body-cell-select="props">
          <q-checkbox v-model="props.selected" />
        </template>
      </q-table>
      <div>
        <q-btn @click="openAddDialog" color="primary" icon="add" label="Add" />
        <q-btn @click="deleteSelectedItems" color="negative" icon="delete" label="Delete selected" />
      </div>
      <q-dialog v-model="deletionNotify" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">Items Deleted</div>
          </q-card-section>
          <q-card-section>
            <div>{{ deletedCount }} items were successfully deleted.</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="OK" v-close-popup @click="deletionNotify = false" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
    <q-dialog v-model="isAddDialogOpen" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Add New Item</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="name" label="Name" />
          <q-input v-model="manufacturer" label="Manufacturer" />
          <q-input v-model="amount" type="number" label="Amount" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Add" color="primary" @click="handleAddItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
      amount
    }
  }
`;

const ADD_ITEM = gql`
  mutation AddItem($name: String!, $manufacturer: String!, $amount: Int!) {
    createItem(name: $name, manufacturer: $manufacturer, amount: $amount) {
      id
      name
      manufacturer
      amount
    }
  }
`;

const DELETE_ITEMS = gql`
  mutation DeleteItems($ids: [Int!]!) {
    deleteItems(ids: $ids) {
      count
    }
  }
`;

export default {
  setup() {
    const name = ref('');
    const manufacturer = ref('');
    const amount = ref(1);
    const limit = ref(10);
    const offset = ref(0);
    const filter = ref('');
    const items = ref([]);
    const selectedItems = ref([]);
    const pagination = ref({
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
    });
    const deletionNotify = ref(false);
    const deletedCount = ref(0);
    const isAddDialogOpen = ref(false);

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

    const { mutate: deleteItems } = useMutation(DELETE_ITEMS, {
      onCompleted: () => {
      },
    });

    const deleteSelectedItems = async () => {
      const ids = selectedItems.value.map((item) => item.id);
      if (ids.length > 0) {
        try {
          await deleteItems({ ids });
          deletedCount.value = ids.length
          selectedItems.value = [];
        } catch (error) {
          console.error('Error deleting items:', error);
        }
      deletionNotify.value = true;
      refetch().catch((error) => console.error('Mutation refetch error:', error));
      }
    };

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
      }
    });

    const handleAddItem = async () => {
      if (name.value && manufacturer.value && amount.value > 0) {
        await mutate({
            name: name.value,
            manufacturer: manufacturer.value,
            amount: amount.value
          }).catch((error) => {
          console.error('Error adding item:', error);
        });
      name.value = '';
      manufacturer.value = '';
      amount.value = 1;
      isAddDialogOpen.value = false;
      refetch().catch((error) => console.error('Mutation refetch error:', error));
      }

    };

    const openAddDialog = () => {
      isAddDialogOpen.value = true;
    }

    const columns = [
      { name: 'id', align: 'center', label: 'ID', field: 'id', sortable: true },
      { name: 'name', align: 'center', label: 'Name', field: 'name', sortable: true },
      { name: 'manufacturer', align: 'center', label: 'Manufacturer', field: 'manufacturer', sortable: true },
      { name: 'amount', align: 'center', label: 'Amount', field: 'amount', sortable: true }
    ];

    return {
      items,
      name,
      manufacturer,
      amount,
      handleAddItem,
      columns,
      filter,
      searchQuery,
      loading,
      error,
      pagination,
      selectedItems,
      deleteSelectedItems,
      deletionNotify,
      isAddDialogOpen,
      openAddDialog,
      deletedCount
    };
  },
};
</script>
