/* *************************
DATAWEAVERS STARTER KIT - Optional functionality - can be removed 
************************* */

import React, { FunctionComponent } from 'react';
import { render, waitFor } from '@testing-library/react';
import { useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { TextProps } from '@sitecore-jss/sitecore-jss-react/types/components/Text';
//Testing component
import { Default } from 'components/Title';

// Mock the SitecoreContext function and Text component of Sitecore JSS module
jest.mock('@sitecore-jss/sitecore-jss-nextjs', () => {
  const originalModule = jest.requireActual('@sitecore-jss/sitecore-jss-nextjs');
  return {
    ...originalModule,
    useSitecoreContext: jest.fn(),
    Text: (({ field }: TextProps) => <p>{field?.value}</p>) as FunctionComponent<TextProps>,
  };
});

// Constants
const fields = {
  data: {
    datasource: {
      url: { path: '/some-path', siteName: 'some-site' },
      field: { jsonValue: { value: 'Test Value', editable: 'editable value' } },
    },
    contextItem: {
      url: { path: '/some-context-path', siteName: 'some-context-site' },
      field: { jsonValue: { value: 'Context Test Value', editable: 'editable value' } },
    },
  },
};
const params = { styles: 'your-styles', RenderingIdentifier: 'your-identifier' };

describe('Title Component', () => {
  // Run test on normal state page
  it('renders correctly in normal page state', async () => {
    // Arrange - Set page state normal
    (useSitecoreContext as jest.Mock).mockImplementation(() => ({
      sitecoreContext: { pageState: 'normal' },
      updateSitecoreContext: jest.fn(),
    }));

    // Act - Render component
    const { container, getByText, getByRole } = render(<Default params={params} fields={fields} />);

    // Assert - test rendered elements
    await waitFor(() => {
      expect(container.querySelector('.component.title.your-styles')).toBeInTheDocument();
      expect(getByText('Test Value')).toBeInTheDocument();
      expect(getByRole('link')).toHaveAttribute('href', '/some-path');
    });
  });

  it('renders correctly in edit page state', async () => {
    // Run test on edit state page
    (useSitecoreContext as jest.Mock).mockImplementation(() => ({
      // Arrange - Set page state edit
      sitecoreContext: { pageState: 'edit' },
      updateSitecoreContext: jest.fn(),
    }));

    // Act - Render component
    const { container, getByText, queryByRole } = render(
      <Default params={params} fields={fields} />
    );

    // Assert - test rendered elements
    await waitFor(() => {
      expect(container.querySelector('.component.title.your-styles')).toBeInTheDocument();
      expect(getByText('Test Value')).toBeInTheDocument();

      // Ensure that there is no link in the 'edit' state
      expect(queryByRole('link')).toBeNull();
    });
  });
});
