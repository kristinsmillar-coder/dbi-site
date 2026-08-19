import { SessionList } from '@dbi/design-system';

export const SemesterOne = () => (
  <SessionList
    sessions={[
      {
        when: 'Session 01 · Tue, Sep 29 · 2:30–4:15 PM',
        title: 'Personal Finance & Wealth Building',
        description:
          'Finance starts with understanding money itself — saving, investing, compounding, risk, and the principles behind long-term wealth.',
      },
      {
        when: 'Session 02 · Wed, Oct 21 · 2:30–4:15 PM',
        title: 'Markets & Investing',
        description:
          'Why does one investment rise while another falls? How markets operate, and how investors evaluate risk, return, and information over instinct.',
      },
      {
        when: 'Session 03 · Tue, Nov 17 · 2:30–4:15 PM',
        title: 'Investment Banking & Corporate Finance',
        description:
          'Move from the investor\u2019s perspective inside the company: raising capital, evaluating investments, allocating resources, analyzing performance.',
      },
      {
        when: 'Rehearsal · Wed, Nov 18 · 2:30–4:30 PM',
        title: 'Know it. Then communicate it.',
        description:
          'A dedicated session to rehearse, receive feedback, refine your reasoning, and prepare for the capstone.',
      },
    ]}
  />
);
