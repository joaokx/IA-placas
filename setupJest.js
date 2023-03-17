import { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();

test('should fetch data from API and render it', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: 'mocked data' }));
  
    const { getByTestId } = render(<MyComponent />);
  
    await waitFor(() => {
      expect(getByTestId('data-element')).toHaveTextContent('mocked data');
    });
  });