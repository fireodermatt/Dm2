import { inject, observer } from "mobx-react";
import React, { Fragment } from "react";
import { LiaTimesSolid } from "react-icons/lia";
import { BemWithSpecifiContext } from "../../../utils/bem";
import { Button } from "../../Common/Button/Button";
import { Icon } from "../../Common/Icon/Icon";
import { Tag } from "../../Common/Tag/Tag";
import { FilterDropdown } from "../FilterDropdown";
import "./FilterLine.styl";
import { FilterOperation } from "./FilterOperation";
import { getRoot } from "mobx-state-tree";

const { Block, Elem } = BemWithSpecifiContext();

const Conjunction = observer(({ index, view }) => {
  return (
    <FilterDropdown
      items={[
        { value: "and", label: "And" },
        { value: "or", label: "Or" },
      ]}
      disabled={index > 1}
      value={view.conjunction}
      style={{ textAlign: "right" }}
      onChange={(value) => view.setConjunction(value)}
    />
  );
});

const GroupWrapper = ({ children, wrap = false }) => {
  return wrap ? <Elem name="group">{children}</Elem> : children;
};
const injector = inject(({ store }) => ({
  store,
}));
const CustomFilter = ({ CustomFilterLine, ...rest }) => <CustomFilterLine {...rest} />;

export const FilterLine = injector(observer(({
  filter,
  availableFilters,
  index,
  view,
  sidebar,
  dropdownClassName,
  store,
}) => {
  const customColumn = getRoot(view).SDK?.customColumns?.[filter.field.alias];
  const CustomFilterLine = customColumn?.renderFilter?.(
    filter,
    availableFilters,
    index,
    view,
    sidebar,
    dropdownClassName,
    store,
  );

  return (
    <Block name="filter-line" tag={Fragment}>
      <GroupWrapper wrap={sidebar}>
        <Elem name="column" mix="conjunction">
          {index === 0 ? (
            <span style={{ fontSize: 12, paddingRight: 5 }}>Where</span>
          ) : (
            <Conjunction index={index} view={view} />
          )}
        </Elem>
        <Elem name="column" mix="field">
          <FilterDropdown
            placeholder="Column"
            defaultValue={filter.filter.id}
            items={availableFilters}
            width={80}
            dropdownWidth={120}
            dropdownClassName={dropdownClassName}
            onChange={(value) => {
              const selectedAlias = value.split(":").pop();
              const customFilter = getRoot(view).SDK?.customColumns?.[selectedAlias];

              customFilter?.onFilterAdd?.(filter, view);
              filter.setFilterDelayed(value);
            }}
            optionRender={({ item: { original: filter } }) => (
              <Elem name="selector">
                {filter.field.title}
                {filter.field.parent && (
                  <Tag
                    size="small"
                    className="filters-data-tag"
                    color="#1d91e4"
                    style={{ marginLeft: 7 }}
                  >
                    {filter.field.parent.title}
                  </Tag>
                )}
              </Elem>
            )}
          />
        </Elem>
      </GroupWrapper>
      <GroupWrapper wrap={sidebar}>
        {CustomFilterLine ? (
          <Elem name='column' mod={{ customFilterLine: true }}>
            <CustomFilter 
              filter={filter}
              field={filter.field}
              view={view} 
              CustomFilterLine={CustomFilterLine}
            />
          </Elem>
        ) : (
          <FilterOperation
            filter={filter}
            value={filter.currentValue}
            operator={filter.operator}
            field={filter.field}
          />
        )}
      </GroupWrapper>
      <Elem name="remove">
        <Button
          type="link"
          onClick={(e) => {
            e.stopPropagation();
            const customFilter = getRoot(view).SDK?.customColumns?.[filter.field.alias];

            customFilter?.onFilterDelete?.(filter, view);
            filter.delete();
          }}
          icon={<Icon icon={LiaTimesSolid} size={12} />}
        />
      </Elem>
    </Block>
  );
},
));
