import requests, sys, time
BASE='http://127.0.0.1:8000'

def die(msg):
    print('ERROR:', msg)
    sys.exit(1)

s = requests.Session()
print('1) Seeding Ohm\'s Law demo...')
r = s.post(f'{BASE}/api/demo/reset-ohms-law')
print('seed status', r.status_code)
if r.status_code!=200:
    die('Seed failed: '+r.text)
print('Seed OK')

print('2) Login demo user...')
r = s.post(f'{BASE}/api/auth/login', json={'email':'student@eduvatar.ai','password':'password123'})
print('login status', r.status_code)
if r.status_code!=200:
    die('Login failed: '+r.text)
token = r.json().get('access_token')
headers={'Authorization':f'Bearer {token}'}
print('Token length', len(token))

print('3) List lessons...')
r = s.get(f'{BASE}/api/lessons', headers=headers)
print('lessons status', r.status_code)
lessons = r.json()
if not lessons:
    die('No lessons found')
lesson = lessons[0]
lesson_id = lesson['id']
print('Using lesson id', lesson_id)

print('4) Get lesson detail...')
r = s.get(f'{BASE}/api/lessons/{lesson_id}', headers=headers)
print('detail status', r.status_code)
ld = r.json()
print('sections:', len(ld.get('sections', [])))

print('5) Select section 0')
r = s.post(f'{BASE}/api/lessons/{lesson_id}/select-concept/0', headers=headers)
print('select status', r.status_code)

# find first question of section 0 (questions are nested in sections)
section0 = ld.get('sections', [])[0]
qs = section0.get('questions', []) if section0 else []
q0 = None
if qs:
    q0 = qs[0]
if not q0:
    die('No question found in section 0')
print('Q0 id', q0['id'], 'text:', q0.get('question_text')[:80])

print('6) Submit correct answer for section 0')
payload = {'lesson_id':lesson_id,'question_id':q0['id'],'student_answer': q0.get('correct_answer') or (q0.get('options')[0]['id'] if q0.get('options') else '4'),'response_time_seconds':4.5,'confidence':0.9}
r = s.post(f'{BASE}/api/teaching/respond', json=payload, headers=headers)
print('respond status', r.status_code, r.text[:200])

print('7) Fetch lesson after answer')
r = s.get(f'{BASE}/api/lessons/{lesson_id}', headers=headers)
print('lesson status', r.status_code)
print('curriculum summary', r.json().get('curriculum_summary'))

print('8) Submit incorrect answer for section 1 (simulate misconception)')
# select section 1
r = s.post(f'{BASE}/api/lessons/{lesson_id}/select-concept/1', headers=headers)
print('select 1 status', r.status_code)
# get latest lesson detail
ld = s.get(f'{BASE}/api/lessons/{lesson_id}', headers=headers).json()
section1 = ld.get('sections', [])[1] if len(ld.get('sections', [])) > 1 else None
qs = section1.get('questions', []) if section1 else []
q1 = None
if qs:
    q1 = qs[0]
if not q1:
    print('No question for section1, skipping')
else:
    print('Q1 id', q1['id'], 'text:', q1.get('question_text')[:80])
    wrong = 'A' if q1.get('correct_answer')!='A' else 'D'
    payload = {'lesson_id':lesson_id,'question_id':q1['id'],'student_answer': wrong,'response_time_seconds':6.0,'confidence':0.6}
    r = s.post(f'{BASE}/api/teaching/respond', json=payload, headers=headers)
    print('respond status', r.status_code, 'body:', r.json())

print('9) Resume lesson')
r = s.post(f'{BASE}/api/lessons/{lesson_id}/resume', headers=headers)
print('resume status', r.status_code, r.json().get('current_section_index'))

print('\nE2E API runner completed successfully')
