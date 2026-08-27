-- Sample programme seed: Law (Cluster 1), Medicine, Nursing (Cluster 13).
-- This is the same working sample used in the earlier prototypes — scale
-- this pattern out to the other ~180 canonical families as data arrives.

insert into programmes (cluster_number, name, minimum_mean_grade, minimum_subjects, minimum_verified, source) values
(1, 'Bachelor of Laws (LLB)', 'C+', '{"English/Kiswahili": "B"}', true, 'KUCCPS Cluster 1 programme page'),
(13, 'Bachelor of Medicine & Bachelor of Surgery (MBChB)', 'C+', '{"Biology":"B","Chemistry":"B","Mathematics/Physics":"B","English/Kiswahili":"B"}', true, 'KMPDC'),
(13, 'Bachelor of Dental Surgery (BDS)', 'C+', '{"Biology":"B","Chemistry":"B","Mathematics/Physics":"B","English/Kiswahili":"B"}', true, 'KMPDC'),
(13, 'Bachelor of Pharmacy (BPharm)', 'C+', '{"Biology":"C+","Chemistry":"C+","Mathematics/Physics":"C+","English/Kiswahili":"C+","cluster_subject_average":"B-"}', true, 'PPB'),
(13, 'Bachelor of Veterinary Medicine (BVM)', 'C+', '{"Biology":"C+","Chemistry":"C+","Mathematics/Physics/Agriculture":"C+"}', true, 'KVB Oct 2024'),
(13, 'Bachelor of Science (Nursing)', null, null, false, null),
(5, 'Bachelor of Engineering (Aeronautical/Aerospace Engineering)', 'C+', '{"Mathematics":"C+","Physics":"C+","Chemistry":"C+","English/Kiswahili":"C+"}', true, 'KUCCPS Cluster 5 programme page');
