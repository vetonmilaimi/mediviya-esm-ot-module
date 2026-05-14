import { Location, OpenmrsResource, Patient, PatientIdentifier, Person } from "@openmrs/esm-framework";
import { SurgicalAppointmentStatusEnum } from "./constants";

export interface ISchedulingRowData {
  id: string;
  status: string;
  patientName: string;
  identifier: string;
  date: string;
  startTime: string;
  ot: string;
  day: string;
  patientAge: string;
  estTime: string;
  actualTime: string;
  surgeon: string;
  procedures: any;
  otherSurgeon: any;
  surgicalAssistant: any;
  anaesthetist: any;
  scrubNurse: any;
  circulatingNurse: any;
  notes: string;
  bedLocation: string;
  bedNumber: string;
  actions: React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>>;
};

export interface AddActualTimeModalPayload {
  appointmentUuid?: string;
  patientName?: string;
  identifier?: string;
  initialStartDatetime?: string;
  initialEndDatetime?: string;
  initialNotes?: string;
}

export type CalendarDetailsModalPayload =
  | {
      kind: 'block';
      block: ISurgicalBlock;
      laneLabel: string;
    }
  | {
      kind: 'appointment';
      block: ISurgicalBlock;
      appointment: ISurgicalAppointment;
      laneLabel: string;
    };

export interface IProvider {
  uuid: string;
  display: string;
  comments?: string;
  response?: string;
  person: OpenmrsResource;
  name?: string;
}

export interface ISurgicalAppointmentAttrubuteType {
  uuid: string;
  name: string;
  format: string;
  sortWeight: number;
  resourceVersion: string;
}

export interface ISurgicalAppointmentAttribute {
  id?: number;
  uuid?: string;
  surgicalAppointmentAttributeType?: ISurgicalAppointmentAttrubuteType;
  value: string;
  resourceVersion?: string;
}

export type TGender = "M" | "F" | "O" | "U";

export interface IPatient {
  uuid: string;
  display: string;
  person: Person;
  identifiers: PatientIdentifier[];
}

export interface ISurgicalAppointment {
  id: number;
  uuid: string;
  patient: IPatient;
  actualStartDatetime?: string;
  actualEndDatetime?: string;
  status: SurgicalAppointmentStatusEnum;
  notes?: string;
  sortWeight?: number;
  bedNumber?: string;
  bedLocation?: string;
  surgicalAppointmentAttributes: ISurgicalAppointmentAttribute[];
}

export type ISurgicalBlock = {
  id: number;
  uuid: string;
  location: Location;
  startDatetime: string;
  endDatetime: string;
  provider: IProvider;
  surgicalAppointments: ISurgicalAppointment[];
};

export interface IFilterOption {
  id: string;
  text: string;
  isSelectAll?: boolean;
}

export interface IFilters {
  surgeon: IFilterOption[];
  location: IFilterOption[];
  patient: { uuid: string, patientIdentifier: string } | null;
  status: IFilterOption[];
}
