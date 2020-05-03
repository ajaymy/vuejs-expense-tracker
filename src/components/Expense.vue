<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-row align="center" justify="center">
          <v-col cols="6" style="height: 300px;">
            <v-card color="#385F73" dark>
              <v-card-title>
                <h1 class="headline">Expense Entry</h1>
              </v-card-title>
              <v-card-text>
                <v-form ref="form">
                  <v-text-field
                    v-model="dateModel"
                    label="Date"
                    prepend-icon="mdi-calendar"
                    :rules="itemRules"
                  />
                  <v-text-field
                    v-model="itemModel"
                    label="Item"
                    prepend-icon="mdi-baguette"
                    :rules="itemRules"
                  />
                  <v-text-field
                    v-model="priceModel"
                    label="Price"
                    prepend-icon="mdi-cash"
                    :rules="numberRules"
                    type="number"
                  />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  class="ma-2"
                  tile
                  outlined
                  color="warning"
                  :loading="loading"
                  :disabled="loading"
                  @click="submitExpenses"
                >
                  <v-icon left>mdi-pencil</v-icon> Add
                </v-btn>
              </v-card-actions>
            </v-card>
            <v-snackbar v-model="snackbar" :vertical="vertical">
              {{ snacktext }}
              <v-btn color="indigo" text @click="snackbar = false">
                Close
              </v-btn>
            </v-snackbar>
          </v-col>
          <v-col cols="6" style="height: 300px;">
            <v-card color="#1F7087" dark>
              <v-card-title>
                <div>
                  <h1 class="headline">{{ currentMonth }}</h1>
                </div>
                <v-spacer></v-spacer>
                <v-avatar color="orange" size="62">
                  <span class="white--text headline">{{
                    currentMonthTotal
                  }}</span>
                </v-avatar>
              </v-card-title>
              <v-card-text> </v-card-text>
            </v-card>
            <v-divider></v-divider>
            <v-card color="#952175" dark>
              <v-card-title>
                <div>
                  <h1 class="headline">{{ prevMonth }}</h1>
                </div>
                <v-spacer></v-spacer>
                <v-avatar color="orange" size="62">
                  <span class="white--text headline">{{ prevMonthTotal }}</span>
                </v-avatar>
              </v-card-title>
              <v-card-text> </v-card-text>
            </v-card>
            <v-divider></v-divider>
            <v-card color="pink darken-2" dark>
              <v-card-title>
                <div>
                  <h1 class="headline">{{ prev2Month }}</h1>
                </div>
                <v-spacer></v-spacer>
                <v-avatar color="orange" size="62">
                  <span class="white--text headline">{{
                    prev2MonthTotal
                  }}</span>
                </v-avatar>
              </v-card-title>
              <v-card-text> </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <!-- <v-col cols="12">
        <v-row justify="center">
          <v-col
            cols="6"
            md="2"
          >
            <v-select
              v-model="alignment"
              :items="alignmentsAvailable"
              label="Align"
            ></v-select>
          </v-col>

          <v-col
            cols="6"
            md="2"
          >
            <v-select
              v-model="justify"
              :items="justifyAvailable"
              label="Justify"
            ></v-select>
          </v-col>
        </v-row>
      </v-col> -->
    </v-row>
  </v-container>
</template>
<script>
import { subMonths, getMonth, format } from 'date-fns';
import axios from 'axios';
export default {
  data: () => ({
    hostURL: process.env.VUE_APP_HOSTURL,
    itemModel: '',
    priceModel: '',
    dateModel: '2020-03-04',
    loading: false,
    numberRules: [
      v => String(v).length > 0 || 'This field may not be empty',
      v => v > 0 || 'The value must be greater than zero'
    ],
    itemRules: [v => String(v).length > 0 || 'This field may not be empty'],
    snackbar: false,
    snacktext: '',
    vertical: true,
    currentMonth: 'MAR',
    currentMonthTotal: '0.00',
    prevMonth: 'FEB',
    prevMonthTotal: '0.00',
    prev2Month: 'JAN',
    prev2MonthTotal: '0.00',
    currentMonthInt: 0,
    prevMonthInt: 0,
    prev2MonthInt: 0
  }),
  mounted: function() {
    this.getMonthlyTotal(0);
  },
  methods: {
    submitExpenses() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        let uri = [this.hostURL, 'exp'].join('/');
        console.log('submitExpenses -> uri', uri);
        axios
          .post(uri, {
            item: this.itemModel,
            price: this.priceModel,
            expenseDate: this.dateModel
          })
          .then(
            response => {
              this.snackbar = true;
              this.loading = false;
              this.snacktext = [
                'Expense added successfully',
                response.statusText
              ].join('-');
              //console.log('Response :', response.status);
              this.getMonthlyTotal(1);
            },
            error => {
              this.snackbar = true;
              this.snacktext = ['Error', error].join('-');
              console.log('Error ', error);
            }
          );
      }
    },
    getMonthlyTotal(flag) {
      this.getMonthInt();
      let uri = [this.hostURL, 'exp', 'total'].join('/');
      axios.get(uri).then(
        response => {
          if (flag === 0) {
            //Mounted call
            this.snacktext = 'Connection to Database established';
            this.snackbar = true;
          }

          this.parseMonthlyResponse(response.data);
          //   let object = JSON.parse(JSON.stringify(response.data));
          //   console.log('getMonthlyTotal -> object', object);
        },
        error => {
          this.snackbar = true;
          this.snacktext = ['Error', error].join('-');
          console.log('GetError: ', error);
        }
      );
    },
    getMonthInt() {
      let today = new Date();
      this.currentMonthInt = getMonth(today);
      this.dateModel = format(today, 'yyyy-MM-dd');
      this.currentMonthInt = this.currentMonthInt + 1; //month array starts at 0; add 1 to match with MongoDB month
      this.currentMonth = format(today, 'MMM');
      this.prevMonthInt = getMonth(subMonths(today, 1));
      this.prevMonthInt = this.prevMonthInt + 1;
      this.prevMonth = format(subMonths(today, 1), 'MMM');
      this.prev2MonthInt = getMonth(subMonths(today, 2));
      this.prev2MonthInt = this.prev2MonthInt + 1;
      this.prev2Month = format(subMonths(today, 2), 'MMM');
    },
    parseMonthlyResponse(monthlyArray) {
      if (monthlyArray.length > 0) {
        monthlyArray.forEach(element => {
          if (element._id.month === this.currentMonthInt) {
            this.currentMonthTotal = element.tot;
          }
          if (element._id.month === this.prevMonthInt) {
            this.prevMonthTotal = element.tot;
          }
          if (element._id.month === this.prev2MonthInt) {
            this.prev2MonthTotal = element.tot;
          }
        });
      }
    }
  }
};
</script>
