"""Expose actual JUnit failures via GitHub annotations, even without log downloads."""
from pathlib import Path
from xml.etree import ElementTree as ET
for report in Path('android/app/build/outputs/androidTest-results').rglob('*.xml'):
    root = ET.parse(report).getroot()
    for case in root.iter('testcase'):
        for failure in list(case.findall('failure')) + list(case.findall('error')):
            text = f"{case.get('classname')}.{case.get('name')}: {failure.get('message', '')}\n{failure.text or ''}"[:9000]
            text = text.replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')
            print(f'::error title=Android instrumentation::{text}')
