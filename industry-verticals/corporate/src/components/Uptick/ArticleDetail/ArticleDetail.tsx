import React from 'react';
import { ComponentFactory } from './ComponentFactory';
import { Container } from 'react-bootstrap';
import { ArticleDetailProps } from './ArticleDetail.types';
import { uptickArticleDetail } from '@/constants/appConstants';

const ArticleDetail = ({ fields }: ArticleDetailProps): JSX.Element | null => {
  if (!fields?.Components?.length) {
    return null;
  }

  return (
    <div className="article-detail" id={uptickArticleDetail.uptickArticleId}>
      <div className="component-content">
        <Container>
          {fields.Components.map((block) => (
            <ComponentFactory key={block.id} {...block} fields={block} />
          ))}
        </Container>
      </div>
    </div>
  );
};

export default ArticleDetail;
