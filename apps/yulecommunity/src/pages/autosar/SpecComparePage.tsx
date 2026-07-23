import { Helmet } from 'react-helmet-async';
import { DevHubLayout } from '../../components/autosar/DevHubLayout';
import { SpecVersionCompare } from '../../components/autosar/SpecVersionCompare';

export function SpecComparePage() {
  return (
    <DevHubLayout title="版本对比" subtitle="比较不同 AUTOSAR 规范版本的 API 差异" backTo="/autosar/spec">
      <Helmet>
        <title>版本对比 - AutoSAR 规范引擎 - YuleTech</title>
      </Helmet>
      <div className="py-8">
        <SpecVersionCompare />
      </div>
    </DevHubLayout>
  );
}
