/**
 * This is the entrypoint file of the application. It communicates the
 * important features of this microfrontend to the app shell. It
 * connects the app shell to the React application(s) that make up this
 * microfrontend.
 */
import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createLeftPanelLink } from './components/configs/create-left-panel-link.component';

const moduleName = '@openmrs/mediviya-esm-operation-theater-module';

const options = {
  featureName: 'operation-theater',
  moduleName,
};

/**
 * This tells the app shell how to obtain translation files: that they
 * are JSON files in the directory `../translations` (which you should
 * see in the directory structure).
 */
export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

/**
 * This function performs any setup that should happen at microfrontend
 * load-time (such as defining the config schema) and then returns an
 * object which describes how the React application(s) should be
 * rendered.
 */
export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

/**
 * This named export tells the app shell that the default export of `root.component.tsx`
 * should be rendered when the route matches `root`. The full route
 * will be `openmrsSpaBase() + 'root'`, which is usually
 * `/openmrs/spa/root`.
 */
export const root = getAsyncLifecycle(() => import('./root'), options);

export const operationTheaterDashboard = getSyncLifecycle(
  createLeftPanelLink({
    name: 'operation-theater/ot-scheduling',
    title: 'Operation Theater',
    slot: 'ot-dashboard-slot',
  }),
  options
);

// export const otSurgicalQueuesPage = getAsyncLifecycle(
//   () => import('./pages/surgical-queues.page'),
//   options,
// );
/**
 * The following are named exports for the extensions defined in this frontend modules. See the `routes.json` file to see how these are used.
 */
export const otSchedulingPage = getAsyncLifecycle(
  () => import('./pages/ot-scheduling.page'),
  options
);

export const newSurgicalBlockPage = getAsyncLifecycle(
  () => import('./pages/surgical-block.page'),
  options
);

export const otSchedulingFiltersWorkspace = getAsyncLifecycle(
  () => import('./components/workspaces/filters/ot-schedulig-filters.workspace'),
  options
);

export const addSurgicalAppointmentWorkspace = getAsyncLifecycle(
  () => import('./components/workspaces/surgical-appointments/surgical-appointment.wokspace'),
  options
)

export const addActualTimeModal = getAsyncLifecycle(
  () => import('./components/modals/add-actual-time-modal.component'),
  options
);

export const moveSurgicalBlockModal = getAsyncLifecycle(
  () => import('./components/modals/move-surgical-block-modal.component'),
  options
);

export const cancelSurgicalBlockModal = getAsyncLifecycle(
  () => import('./components/modals/cancel-surgical-block.modal'),
  options
);

export const cancelSurgicalAppointmentModal = getAsyncLifecycle(
  () => import('./components/modals/cancel-surgical-appointent.modal'),
  options
);

export const calendarDetailsModal = getAsyncLifecycle(
  () => import('./components/modals/calendar-details-modal.component'),
  options
);
// export const blueBox = getAsyncLifecycle(() => import('./boxes/extensions/blue-box.component'), options);

// export const brandBox = getAsyncLifecycle(() => import('./boxes/extensions/brand-box.component'), options);
