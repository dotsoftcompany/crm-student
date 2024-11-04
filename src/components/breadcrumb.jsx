import React from 'react';
import { Link } from 'react-router-dom';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SheetMenu } from './layout/sheet-menu';

function BreadcrumbComponent({
  title,
  titleLink = null,
  subtitle,
  subtitleLink = null,
  subtitle2,
}) {
  return (
    <div className="flex items-center gap-2">
      <SheetMenu />
      <Breadcrumb className="overflow-x-auto whitespace-nowrap w-full">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Asosiy</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link
              to={subtitle ? titleLink : null}
              className={subtitle ? 'cursor-pointer' : 'cursor-text'}
            >
              <BreadcrumbLink>{title}</BreadcrumbLink>
            </Link>
          </BreadcrumbItem>
          {subtitle && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Link
                  to={subtitle2 ? subtitleLink : null}
                  className={subtitle ? 'cursor-pointer' : 'cursor-text'}
                >
                  <BreadcrumbLink>{subtitle}</BreadcrumbLink>
                </Link>
              </BreadcrumbItem>
            </>
          )}
          {subtitle2 && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>{subtitle2}</BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

export default BreadcrumbComponent;
