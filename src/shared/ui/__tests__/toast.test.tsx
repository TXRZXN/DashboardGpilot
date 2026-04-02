import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from '../toast';
import React from 'react';

describe('Toast', () => {
  it('Toast_RendersTitleAndDescription_WhenOpen', () => {
    render(
      <Toast 
        open={true} 
        title="Success" 
        description="Operation completed" 
        variant="success" 
      />
    );

    expect(screen.getByText('Success')).toBeDefined();
    expect(screen.getByText('Operation completed')).toBeDefined();
  });

  it('Toast_DoesNotRender_WhenClosed', () => {
    render(
      <Toast 
        open={false} 
        title="Success" 
      />
    );

    expect(screen.queryByText('Success')).toBeNull();
  });

  it('Toast_OnClose_TriggersCallback', () => {
    const onOpenChange = vi.fn();
    render(
      <Toast 
        open={true} 
        title="Success" 
        onOpenChange={onOpenChange} 
      />
    );

    // MUI Alert close button usually has an 'aria-label' or title 'Close'
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
