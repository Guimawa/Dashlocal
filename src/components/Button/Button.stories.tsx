import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    label: 'Cliquez-moi',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Désactivé',
    disabled: true,
  },
};

export const Submit: Story = {
  args: {
    label: 'Envoyer',
    type: 'submit',
  },
};
