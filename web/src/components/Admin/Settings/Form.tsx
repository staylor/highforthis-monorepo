import { useTranslation } from 'react-i18next';

import Form from '~/components/Admin/Form';
import { Heading } from '~/components/Admin/styles';
import Message from '~/components/Form/Message';
import type { Fields } from '~/types';
import type {
  DashboardSettings,
  MediaSettings,
  PodcastSettings,
  SiteSettings,
} from '~/types/graphql';

interface SettingsFormProps {
  data?: SiteSettings | PodcastSettings | DashboardSettings | MediaSettings;
  heading: string;
  fields: Fields;
}

export default function SettingsForm({ data, heading, fields }: SettingsFormProps) {
  const { t } = useTranslation();
  return (
    <>
      <Heading>{heading}</Heading>
      <Message text={t('settings.updated')} />
      <Form data={data} fields={fields} buttonLabel={t('settings.update')} />
    </>
  );
}
