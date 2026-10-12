import React from 'react';
import AIWorkspace from "../components/AIWorkspace";
const feature = {"id":"gap-no-mobile-field","title":"No mobile/field","description":"Prepare a professional advisory report for no mobile/field using the brief and evidence you provide. Review the findings, assumptions, and action plan before applying changes.","samples":[]};
export default function GapNoMobileFieldPage({ token } = {}) { return <AIWorkspace feature={feature} token={token} />; }
