#!/usr/bin/env python
# coding: utf-8

import pandas as pd
import numpy as np
import csv
import json
from slugify import slugify

# Data files.
PAIRS = [
    ['./ccd_sch_029_1415_w_0216601a.txt', './2014-15 CCD Companion_SCH Directory_File_Layout.xlsx'],
    ['./ccd_rpgm_029_1415_w_0216161a.txt', './2014-15 CCD Companion_SCH Reportable Programs_File_Layout.xlsx'],
    ['./ccd_sch_052_1415_w_0216161a.txt', './2014-15 CCD Companion_School Membership_File_Layout.xlsx'],
    ['./ccd_sch_059_1415_w_0216161a.txt', './2014-15 CCD Companion_SCH Staff_File_Layout.xlsx'],
    ['./ccd_sch_129_1415_w_0216161a.txt', './2014-15 CCD Companion_SCH CCD School_File_Layout.xlsx'],
    ['./ccd_sch_033_1415_w_0216161a.txt', './2014-15 CCD Companion_SCH Free Lunch_File_Layout.xlsx'],
]

# Map from slugs to simplified slugs.
SLUG_MAPPINGS = {
    'school_name': 'name',
    'location_city': 'city',
    'location_state_two_letter_u_s_postal_service_abbreviation_see_state_codes_tab': 'state',
    'location_5_digit_zip_code': 'zip',
    'telephone_number': 'phone',
    'education_agency_name': 'agency',
    'school_type_description': 'type',
}
    # 'street_address'
    # 'mailing_address'

    # lat,lng?

def get_desc(desc):
    period = desc.find('.')
    paren = desc.find('(')
    idx = period if period < paren else paren
    if idx > -1:
        return desc[:idx]
    return desc

def get_slug(colname, abbrevs_to_desc):
    slug = slugify(abbrevs_to_desc[colname], separator='_')
    return SLUG_MAPPINGS.get(slug, slug)

def load_annotated_dataframe(data_path, defs_path):
    data = pd.read_csv(data_path, delimiter='\t', dtype='unicode')
    defs = pd.read_excel(defs_path, verbose=True)
    abbrevs_to_desc = dict(zip(defs['Variable Name'].values, defs['Description'].values))
    data.columns = [get_slug(colname, abbrevs_to_desc) for colname in data.columns]
    # TODO add name slug for name and agency, create address, etc.
    data.set_index('nces_school_identifier')
    return data

print 'Loading...'
dfs = [load_annotated_dataframe(pair[0], pair[1]) for pair in PAIRS]

print 'Combining...'
x = pd.DataFrame()
for df in dfs:
    x = x.combine_first(df)
print x.shape

print 'Writing...'
x.to_csv('processed_data.csv')
print 'Done.'
