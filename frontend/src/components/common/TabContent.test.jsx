/**
 * Tests unitaires pour le composant TabContent
 */

import { render, screen } from '@testing-library/react';
import TabContent from './TabContent';

describe('TabContent Component', () => {
  test('devrait rendre le contenu enfant', () => {
    render(
      <TabContent id="test-tab" activeTab="test-tab">
        <div>Test Content</div>
      </TabContent>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('devrait avoir la classe active quand id correspond à activeTab', () => {
    const { container } = render(
      <TabContent id="dashboard" activeTab="dashboard">
        <div>Dashboard Content</div>
      </TabContent>
    );
    
    const tabContentDiv = container.querySelector('.tab-content');
    expect(tabContentDiv).toHaveClass('tab-content', 'active');
  });

  test('ne devrait pas avoir la classe active quand id ne correspond pas à activeTab', () => {
    const { container } = render(
      <TabContent id="dashboard" activeTab="references">
        <div>Dashboard Content</div>
      </TabContent>
    );
    
    const tabContentDiv = container.querySelector('.tab-content');
    expect(tabContentDiv).toHaveClass('tab-content');
    expect(tabContentDiv).not.toHaveClass('active');
  });

  test('devrait avoir le bon ID', () => {
    const { container } = render(
      <TabContent id="test-id" activeTab="other">
        <div>Content</div>
      </TabContent>
    );
    
    const tabContentDiv = container.querySelector('#test-id');
    expect(tabContentDiv).toBeInTheDocument();
  });

  test('devrait rendre plusieurs enfants', () => {
    render(
      <TabContent id="test" activeTab="test">
        <h1>Title</h1>
        <p>Paragraph</p>
        <div>Another div</div>
      </TabContent>
    );
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Another div')).toBeInTheDocument();
  });

  test('devrait rendre des composants complexes en enfants', () => {
    const ComplexChild = () => (
      <div>
        <button>Click me</button>
        <input placeholder="Type here" />
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    );

    render(
      <TabContent id="complex" activeTab="complex">
        <ComplexChild />
      </TabContent>
    );
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  test('devrait gérer les changements d\'état actif', () => {
    const { container, rerender } = render(
      <TabContent id="test" activeTab="other">
        <div>Content</div>
      </TabContent>
    );
    
    let tabContentDiv = container.querySelector('.tab-content');
    expect(tabContentDiv).not.toHaveClass('active');
    
    // Changer pour que ce TabContent devienne actif
    rerender(
      <TabContent id="test" activeTab="test">
        <div>Content</div>
      </TabContent>
    );
    
    tabContentDiv = container.querySelector('.tab-content');
    expect(tabContentDiv).toHaveClass('active');
  });

  test('devrait préserver le contenu même quand inactif', () => {
    render(
      <TabContent id="test" activeTab="other">
        <div>This content should still be rendered</div>
      </TabContent>
    );
    
    // Le contenu doit être rendu même si l'onglet n'est pas actif
    expect(screen.getByText('This content should still be rendered')).toBeInTheDocument();
  });

  test('devrait avoir la structure HTML correcte', () => {
    const { container } = render(
      <TabContent id="test-content" activeTab="test-content">
        <div>Content</div>
      </TabContent>
    );
    
    const outerDiv = container.firstChild;
    expect(outerDiv.tagName).toBe('DIV');
    expect(outerDiv).toHaveAttribute('id', 'test-content');
    expect(outerDiv).toHaveClass('tab-content', 'active');
  });

  test('devrait gérer les props manquantes gracieusement', () => {
    expect(() => {
      render(
        <TabContent id={undefined} activeTab={undefined}>
          <div>Content</div>
        </TabContent>
      );
    }).not.toThrow();
  });

  test('devrait gérer l\'absence d\'enfants', () => {
    const { container } = render(
      <TabContent id="empty" activeTab="empty">
      </TabContent>
    );
    
    const tabContentDiv = container.querySelector('.tab-content');
    expect(tabContentDiv).toBeInTheDocument();
    expect(tabContentDiv).toBeEmptyDOMElement();
  });

  test('devrait gérer les enfants null ou undefined', () => {
    expect(() => {
      render(
        <TabContent id="null-children" activeTab="null-children">
          {null}
          {undefined}
        </TabContent>
      );
    }).not.toThrow();
  });

  test('devrait supporter différents types d\'IDs', () => {
    const testIds = ['simple', 'with-dash', 'with_underscore', 'withNumbers123'];
    
    testIds.forEach(testId => {
      const { container } = render(
        <TabContent id={testId} activeTab={testId}>
          <div>{testId} content</div>
        </TabContent>
      );
      
      expect(container.querySelector(`#${testId}`)).toBeInTheDocument();
    });
  });

  test('devrait rendre correctement avec des props réactives', () => {
    const { rerender } = render(
      <TabContent id="reactive" activeTab="other">
        <div>Original Content</div>
      </TabContent>
    );
    
    // Changer le contenu
    rerender(
      <TabContent id="reactive" activeTab="reactive">
        <div>Updated Content</div>
      </TabContent>
    );
    
    expect(screen.getByText('Updated Content')).toBeInTheDocument();
    expect(screen.queryByText('Original Content')).not.toBeInTheDocument();
  });
});