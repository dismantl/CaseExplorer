/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const dscr = `query Dscr(
  $start_row: Int
  $end_row: Int
  $row_group_cols: [ValueColumn]
  $value_cols: [ValueColumn]
  $pivot_cols: [ValueColumn]
  $pivot_mode: Boolean
  $group_keys: [String]
  $sort_model: [SortColumn]
  $filter_model: FilterModel
) {
  dscr(
    start_row: $start_row
    end_row: $end_row
    row_group_cols: $row_group_cols
    value_cols: $value_cols
    pivot_cols: $pivot_cols
    pivot_mode: $pivot_mode
    group_keys: $group_keys
    sort_model: $sort_model
    filter_model: $filter_model
  ) {
    rows {
      charges {
        id
        charge_number
        charge_description
        statute
        statute_description
        amended_date
        amended_date_str
        cjis_code
        mo_pll
        probable_cause
        incident_date_from
        incident_date_from_str
        incident_date_to
        incident_date_to_str
        victim_age
        plea
        disposition
        disposition_date
        disposition_date_str
        fine
        court_costs
        cicf
        suspended_fine
        suspended_court_costs
        suspended_cicf
        pbj_end_date
        pbj_end_date_str
        probation_end_date
        probation_end_date_str
        restitution_amount
        jail_term_years
        jail_term_months
        jail_term_days
        suspended_term_years
        suspended_term_months
        suspended_term_days
        credit_time_served
        case_number
      }
      defendants {
        id
        race
        sex
        height
        weight
        city
        state
        zip_code
        case_number
      }
      defendant_aliases {
        id
        alias_name
        address_1
        address_2
        city
        state
        zip_code
        case_number
      }
      related_persons {
        id
        name
        connection
        address_1
        address_2
        city
        state
        zip_code
        agency_code
        agency_sub_code
        officer_id
        attorney_code
        attorney_firm
        case_number
      }
      events {
        id
        event_name
        date
        date_str
        comment
        case_number
      }
      trials {
        id
        date
        date_str
        time
        time_str
        room
        trial_type
        location
        reason
        case_number
      }
      bail_events {
        id
        event_name
        date
        date_str
        bail_amount
        code
        percentage_required
        type_of_bond
        judge_id
        case_number
      }
      id
      court_system
      tracking_number
      case_type
      district_code
      location_code
      document_type
      issued_date
      issued_date_str
      case_status
      case_disposition
      case_number
    }
    last_row
  }
}
`;
export const odytraf = `query Odytraf(
  $start_row: Int
  $end_row: Int
  $row_group_cols: [ValueColumn]
  $value_cols: [ValueColumn]
  $pivot_cols: [ValueColumn]
  $pivot_mode: Boolean
  $group_keys: [String]
  $sort_model: [SortColumn]
  $filter_model: FilterModel
) {
  odytraf(
    start_row: $start_row
    end_row: $end_row
    row_group_cols: $row_group_cols
    value_cols: $value_cols
    pivot_cols: $pivot_cols
    pivot_mode: $pivot_mode
    group_keys: $group_keys
    sort_model: $sort_model
    filter_model: $filter_model
  ) {
    rows {
      reference_numbers {
        id
        ref_num
        ref_num_type
        case_number
      }
      defendants {
        id
        race
        sex
        weight
        city
        state
        zip_code
        height
        case_number
      }
      involved_parties {
        id
        party_type
        name
        agency_name
        address_1
        address_2
        city
        state
        zip_code
        case_number
      }
      court_schedules {
        id
        event_type
        date
        date_str
        time
        time_str
        location
        room
        result
        case_number
      }
      charges {
        id
        charge_number
        charge_description
        statute_code
        speed_limit
        recorded_speed
        location_stopped
        probable_cause_indicator
        charge_contributed_to_accident
        charge_personal_injury
        property_damage
        seat_belts
        mandatory_court_appearance
        fine_amount_owed
        vehicle_tag
        state
        vehicle_description
        convicted_speed
        disposition_contributed_to_accident
        disposition_personal_injury
        plea
        plea_date
        plea_date_str
        disposition
        disposition_date
        disposition_date_str
        converted_disposition
        probation_start_date
        probation_start_date_str
        probation_supervised_years
        probation_supervised_months
        probation_supervised_days
        probation_supervised_hours
        probation_unsupervised_years
        probation_unsupervised_months
        probation_unsupervised_days
        probation_unsupervised_hours
        jail_life_death
        jail_start_date
        jail_start_date_str
        jail_years
        jail_months
        jail_days
        jail_hours
        jail_suspended_years
        jail_suspended_months
        jail_suspended_days
        jail_suspended_hours
        jail_suspend_all_but_years
        jail_suspend_all_but_months
        jail_suspend_all_but_days
        jail_suspend_all_but_hours
        case_number
      }
      warrants {
        id
        warrant_type
        issue_date
        issue_date_str
        last_status
        status_date
        status_date_str
        case_number
      }
      bail_bonds {
        id
        bond_type
        bond_amount_set
        bond_status_date
        bond_status_date_str
        bond_status
        case_number
      }
      bond_settings {
        id
        bail_date
        bail_date_str
        bail_setting_type
        bail_amount
        case_number
      }
      documents {
        id
        file_date
        file_date_str
        filed_by
        document_name
        comment
        case_number
      }
      services {
        id
        service_type
        requested_by
        issued_date
        issued_date_str
        service_status
        case_number
      }
      id
      court_system
      location
      citation_number
      case_title
      case_type
      filing_date
      filing_date_str
      violation_date
      violation_date_str
      violation_time
      violation_time_str
      violation_county
      agency_name
      officer_id
      officer_name
      case_status
      case_number
    }
    last_row
  }
}
`;
export const dscivil = `query Dscivil(
  $start_row: Int
  $end_row: Int
  $row_group_cols: [ValueColumn]
  $value_cols: [ValueColumn]
  $pivot_cols: [ValueColumn]
  $pivot_mode: Boolean
  $group_keys: [String]
  $sort_model: [SortColumn]
  $filter_model: FilterModel
) {
  dscivil(
    start_row: $start_row
    end_row: $end_row
    row_group_cols: $row_group_cols
    value_cols: $value_cols
    pivot_cols: $pivot_cols
    pivot_mode: $pivot_mode
    group_keys: $group_keys
    sort_model: $sort_model
    filter_model: $filter_model
  ) {
    rows {
      complaints {
        id
        complaint_number
        plaintiff
        complaint_type
        complaint_status
        status_date
        status_date_str
        filing_date
        filing_date_str
        amount
        last_activity_date
        last_activity_date_str
        case_number
      }
      events {
        id
        event_name
        date
        date_str
        comment
        complaint_number
        case_number
      }
      trials {
        id
        date
        date_str
        time
        time_str
        room
        trial_type
        location
        reason
        case_number
      }
      id
      court_system
      claim_type
      district_code
      location_code
      filing_date
      filing_date_str
      case_status
      case_number
    }
    last_row
  }
}
`;
export const dsk8 = `query Dsk8(
  $start_row: Int
  $end_row: Int
  $row_group_cols: [ValueColumn]
  $value_cols: [ValueColumn]
  $pivot_cols: [ValueColumn]
  $pivot_mode: Boolean
  $group_keys: [String]
  $sort_model: [SortColumn]
  $filter_model: FilterModel
) {
  dsk8(
    start_row: $start_row
    end_row: $end_row
    row_group_cols: $row_group_cols
    value_cols: $value_cols
    pivot_cols: $pivot_cols
    pivot_mode: $pivot_mode
    group_keys: $group_keys
    sort_model: $sort_model
    filter_model: $filter_model
  ) {
    rows {
      charges {
        id
        charge_number
        cjis_traffic_code
        arrest_citation_number
        description
        plea
        plea_date
        plea_date_str
        disposition
        disposition_date
        disposition_date_str
        verdict
        verdict_date
        verdict_date_str
        court_costs
        fine
        sentence_starts
        sentence_starts_str
        sentence_date
        sentence_date_str
        sentence_term
        sentence_years
        sentence_months
        sentence_days
        confinement
        suspended_years
        suspended_months
        suspended_days
        probation_years
        probation_months
        probation_days
        probation_type
        case_number
      }
      bail_and_bonds {
        id
        bail_amount
        bail_number
        set_date
        set_date_str
        release_date
        release_date_str
        release_reason
        bail_set_location
        bond_type
        ground_rent
        mortgage
        property_value
        property_address
        forfeit_date
        forfeit_date_str
        forfeit_extended_date
        forfeit_extended_date_str
        days_extended
        bondsman_company_name
        judgment_date
        judgment_date_str
        case_number
      }
      defendants {
        id
        race
        sex
        height
        weight
        city
        state
        zip_code
        case_number
      }
      defendant_aliases {
        id
        alias_name
        address_1
        address_2
        city
        state
        zip_code
        case_number
      }
      related_persons {
        id
        name
        connection
        address_1
        address_2
        city
        state
        zip_code
        agency_code
        agency_sub_code
        officer_id
        attorney_code
        attorney_firm
        case_number
      }
      events {
        id
        event_name
        date
        date_str
        comment
        case_number
      }
      trials {
        id
        date
        date_str
        time
        time_str
        room
        trial_type
        location
        reason
        case_number
      }
      id
      court_system
      case_status
      status_date
      status_date_str
      tracking_number
      complaint_number
      district_case_number
      filing_date
      filing_date_str
      incident_date
      incident_date_str
      case_number
    }
    last_row
  }
}
`;
export const cc = `query Cc(
  $start_row: Int
  $end_row: Int
  $row_group_cols: [ValueColumn]
  $value_cols: [ValueColumn]
  $pivot_cols: [ValueColumn]
  $pivot_mode: Boolean
  $group_keys: [String]
  $sort_model: [SortColumn]
  $filter_model: FilterModel
) {
  cc(
    start_row: $start_row
    end_row: $end_row
    row_group_cols: $row_group_cols
    value_cols: $value_cols
    pivot_cols: $pivot_cols
    pivot_mode: $pivot_mode
    group_keys: $group_keys
    sort_model: $sort_model
    filter_model: $filter_model
  ) {
    rows {
      district_case_numbers {
        id
        district_case_number
        case_number
      }
      plaintiffs {
        id
        party_type
        party_number
        name
        business_org_name
        case_number
      }
      defendants {
        id
        party_type
        party_number
        business_org_name
        case_number
      }
      related_persons {
        id
        party_type
        party_number
        name
        business_org_name
        case_number
      }
      court_schedules {
        id
        event_type
        notice_date
        notice_date_str
        event_date
        event_date_str
        event_time
        event_time_str
        result
        result_date
        result_date_str
        case_number
      }
      documents {
        id
        document_number
        sequence_number
        file_date
        file_date_str
        entered_date
        entered_date_str
        decision
        party_type
        party_number
        document_name
        text
        case_number
      }
      judgments {
        id
        judgment_type
        entered_date
        entered_date_str
        amount
        amount_other
        prejudgment_interest
        appearance_fee
        filing_fee
        other_fee
        service_fee
        witness_fee
        attorney_fee
        total_indexed_judgment
        tij_other
        comments
        case_number
      }
      support_orders {
        id
        order_id
        version
        order_date
        order_date_str
        obligor
        effective_date
        effective_date_str
        effective_date_text
        status
        date
        date_str
        reason
        support_amount
        support_frequency
        support_to
        arrears_amount
        arrears_frequency
        arrears_to
        mapr_amount
        mapr_frequency
        medical_insurance_report_date
        medical_insurance_report_date_str
        btr_amount
        btr_frequency
        lien
        provisions
        case_number
      }
      id
      court_system
      title
      case_type
      filing_date
      filing_date_str
      case_status
      case_disposition
      disposition_date
      disposition_date_str
      case_number
    }
    last_row
  }
}
`;
export const odycrim = `query Odycrim(
  $start_row: Int
  $end_row: Int
  $row_group_cols: [ValueColumn]
  $value_cols: [ValueColumn]
  $pivot_cols: [ValueColumn]
  $pivot_mode: Boolean
  $group_keys: [String]
  $sort_model: [SortColumn]
  $filter_model: FilterModel
) {
  odycrim(
    start_row: $start_row
    end_row: $end_row
    row_group_cols: $row_group_cols
    value_cols: $value_cols
    pivot_cols: $pivot_cols
    pivot_mode: $pivot_mode
    group_keys: $group_keys
    sort_model: $sort_model
    filter_model: $filter_model
  ) {
    rows {
      reference_numbers {
        id
        ref_num
        ref_num_type
        case_number
      }
      defendants {
        id
        race
        sex
        weight
        city
        state
        zip_code
        height
        hair_color
        eye_color
        case_number
      }
      involved_parties {
        id
        party_type
        name
        agency_name
        address_1
        address_2
        city
        state
        zip_code
        case_number
      }
      court_schedules {
        id
        event_type
        date
        date_str
        time
        time_str
        location
        room
        result
        case_number
      }
      charges {
        id
        charge_number
        cjis_code
        statute_code
        charge_description
        charge_class
        probable_cause
        offense_date_from
        offense_date_from_str
        offense_date_to
        offense_date_to_str
        agency_name
        officer_id
        plea
        plea_date
        plea_date_str
        disposition
        disposition_date
        disposition_date_str
        converted_disposition
        jail_life
        jail_death
        jail_start_date
        jail_start_date_str
        jail_years
        jail_months
        jail_days
        jail_hours
        jail_suspended_term
        jail_suspended_years
        jail_suspended_months
        jail_suspended_days
        jail_suspended_hours
        jail_suspend_all_but_years
        jail_suspend_all_but_months
        jail_suspend_all_but_days
        jail_suspend_all_but_hours
        case_number
      }
      probation {
        id
        probation_start_date
        probation_start_date_str
        probation_supervised
        probation_supervised_years
        probation_supervised_months
        probation_supervised_days
        probation_supervised_hours
        probation_unsupervised
        probation_unsupervised_years
        probation_unsupervised_months
        probation_unsupervised_days
        probation_unsupervised_hours
        case_number
      }
      restitutions {
        id
        restitution_amount
        restitution_entered_date
        restitution_entered_date_str
        case_number
      }
      warrants {
        id
        warrant_type
        issue_date
        issue_date_str
        last_status
        status_date
        status_date_str
        case_number
      }
      bail_bonds {
        id
        bond_type
        bond_amount_posted
        bond_status_date
        bond_status_date_str
        bond_status
        case_number
      }
      bond_settings {
        id
        bail_date
        bail_date_str
        bail_setting_type
        bail_amount
        case_number
      }
      documents {
        id
        file_date
        file_date_str
        filed_by
        document_name
        case_number
      }
      services {
        id
        service_type
        issued_date
        issued_date_str
        service_status
        case_number
      }
      id
      court_system
      location
      case_title
      case_type
      filing_date
      filing_date_str
      case_status
      tracking_numbers
      case_number
    }
    last_row
  }
}
`;
export const cases = `query Cases(
  $start_row: Int
  $end_row: Int
  $row_group_cols: [ValueColumn]
  $value_cols: [ValueColumn]
  $pivot_cols: [ValueColumn]
  $pivot_mode: Boolean
  $group_keys: [String]
  $sort_model: [SortColumn]
  $filter_model: FilterModel
) {
  cases(
    start_row: $start_row
    end_row: $end_row
    row_group_cols: $row_group_cols
    value_cols: $value_cols
    pivot_cols: $pivot_cols
    pivot_mode: $pivot_mode
    group_keys: $group_keys
    sort_model: $sort_model
    filter_model: $filter_model
  ) {
    rows {
      case_number
      court
      case_type
      filing_date
      filing_date_original
      status
      caption
      loc
      detail_loc
      url
      last_scrape
      last_parse
      scrape_exempt
      parse_exempt
      dscr {
        id
        court_system
        tracking_number
        case_type
        district_code
        location_code
        document_type
        issued_date
        issued_date_str
        case_status
        case_disposition
        case_number
      }
      odytraf {
        id
        court_system
        location
        citation_number
        case_title
        case_type
        filing_date
        filing_date_str
        violation_date
        violation_date_str
        violation_time
        violation_time_str
        violation_county
        agency_name
        officer_id
        officer_name
        case_status
        case_number
      }
      dscivil {
        id
        court_system
        claim_type
        district_code
        location_code
        filing_date
        filing_date_str
        case_status
        case_number
      }
      dsk8 {
        id
        court_system
        case_status
        status_date
        status_date_str
        tracking_number
        complaint_number
        district_case_number
        filing_date
        filing_date_str
        incident_date
        incident_date_str
        case_number
      }
      cc {
        id
        court_system
        title
        case_type
        filing_date
        filing_date_str
        case_status
        case_disposition
        disposition_date
        disposition_date_str
        case_number
      }
      odycrim {
        id
        court_system
        location
        case_title
        case_type
        filing_date
        filing_date_str
        case_status
        tracking_numbers
        case_number
      }
    }
    last_row
  }
}
`;
