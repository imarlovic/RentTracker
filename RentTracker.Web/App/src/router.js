import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

const AuthView = () => import(/* webpackChunkName: "AuthView" */ "@/views/AuthView.vue");

const AppView = () => import(/* webpackChunkName: "AppView" */ "@/views/AppView.vue");

const UpcomingView = () =>
  import(/* webpackChunkName: "UpcomingView" */ "@/views/UpcomingView.vue");

const ApartmentsView = () =>
  import(/* webpackChunkName: "ApartmentsView" */ "@/views/ApartmentsView.vue");

const CalendarView = () =>
  import(/* webpackChunkName: "CalendarView" */ "@/views/CalendarView.vue");
const Calendar = () =>
  import(/* webpackChunkName: "CalendarView" */ "@/components/calendar/Calendar.vue");
const LinkedCalendars = () =>
  import(/* webpackChunkName: "CalendarView" */ "@/components/calendar/LinkedCalendars.vue");

const ExpensesView = () =>
  import(/* webpackChunkName: "ExpensesView" */ "@/views/ExpensesView.vue");
const ExpenseList = () =>
  import(/* webpackChunkName: "ExpensesView" */ "@/components/expense/ExpenseList.vue");

const IntegrationView = () =>
  import(/* webpackChunkName: "IntegrationView" */ "@/views/IntegrationView.vue")

const BusinessAnalysisView = () =>
  import(/* webpackChunkName: "BusinessAnalysisView" */ "@/views/BusinessAnalysisView.vue")

const DocumentsView = () =>
  import(/* webpackChunkName: "DocumentsView" */ "@/views/DocumentsView.vue");
const DocumentList = () =>
  import(/* webpackChunkName: "DocumentsView" */ "@/components/document/DocumentList.vue");

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/auth/login",
      component: AuthView
    },
    {
      path: "/",
      component: AppView,
      children: [
        {
          path: "",
          redirect: "/upcoming"
        },
        {
          path: "upcoming",
          component: UpcomingView
        },
        {
          path: "apartments",
          component: ApartmentsView
        },
        {
          path: "calendar",
          component: CalendarView,
          children: [
            {
              path: "",
              component: Calendar
            },
            {
              path: "linked",
              component: LinkedCalendars
            }
          ]
        },
        {
          path: "expenses",
          component: ExpensesView,
          children: [
            {
              path: "",
              component: ExpenseList
            }
          ]
        },
        {
          path: "documents",
          component: DocumentsView,
          children: [
            {
              path: "",
              component: DocumentList
            },
          ]
        },
        {
          path: "integrations",
          component: IntegrationView
        },
        {
          path: "business-analysis",
          component: BusinessAnalysisView
        },
      ]
    }
  ]
});
