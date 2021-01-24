import React, { PureComponent } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import formatNumber from '@/utils/formatNumber';
import CommonTime from '@/common/Time';
import CommonLink from '@/common/Link';
import PageView from '@/common/View/PageView';
import PageViewTable from '@/common/View/PageViewTable';
import Loading from '@/common/Loading';
import { withStyles, createStyles } from '@material-ui/core/styles';
import { encoding } from '@starcoin/starcoin';
import { getTxnData } from '@/utils/sdk';

const useStyles = () => createStyles({
  table: {
    width: '100%',
    display: 'block',
  },
  shrinkMaxCol: {
    flex: '1 100 auto',
    minWidth: 60,
  },
  shrinkCol: {
    flex: '1 10 auto',
  },
});

interface IndexProps {
  classes: any;
  match: any;
  transaction: any;
  getTransaction: (data: any, callback?: any) => any;
}

interface IndexState {
  txnData: any,
}

class Index extends PureComponent<IndexProps, IndexState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    match: {},
    transaction: null,
    getTransaction: () => {}
  };

  constructor(props: IndexProps) {
    super(props);
    this.state = {
      txnData: undefined
    };
  }

  componentDidMount() {
    const hash = this.props.match.params.hash;
    this.props.getTransaction({ hash });
  }

  generateExtra() {
    const { transaction, classes } = this.props;
    const isInitialLoad = !transaction;
    const events = transaction.hits.hits[0]._source.events || [];
    const eventsTable: any[] = [];
    events.forEach((event: any) => {
      const columns: any[] = [];
      columns.push(['Data', event.data]);
      columns.push(['Key', event.event_key]);
      columns.push(['Seq', formatNumber(event.event_seq_number)]);
      eventsTable.push(<PageViewTable columns={columns} />);
    });

    return (
      <div>
        <br />
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography variant="h5" gutterBottom>Events</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className={classes.table}>
              <div className={classes.table}>
                {isInitialLoad ? <Loading /> : events.length ? eventsTable : <Typography variant="body1">No Event Data</Typography>}
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>
    );
  }

  render() {
    const { transaction } = this.props;
    if (!transaction) {
      return null;
    }
    const source = transaction.hits.hits[0]._source;
    const payloadInHex = source.user_transaction.raw_txn.payload || '';
    const txnPayload = encoding.decodeTransactionPayload(payloadInHex);
    const type = Object.keys(txnPayload)[0];
    if (!this.state.txnData) {
      getTxnData(source.transaction_hash).then(data => {
        this.setState({ txnData: data });
      });
    }
    const columns = [
      ['Hash', source.transaction_hash],
      ['Type', type],
      ['Block Hash', <CommonLink path={`/blocks/detail/${source.block_hash}`} title={source.block_hash} />],
      ['Block Height', formatNumber(source.block_number)],
      ['Time', <CommonTime time={source.timestamp} />],
      ['State Root Hash', source.state_root_hash],
      ['Status', source.status],
      ['Gas Used', source.gas_used],
      ['Txn Data', this.state.txnData ? JSON.stringify(this.state.txnData) : <CircularProgress size="1rem" />],
    ];

    return (
      <PageView
        id={source.transaction_hash}
        title="Transaction"
        name="Transaction"
        pluralName="Transaction"
        searchRoute="/transaction"
        bodyColumns={columns}
        extra={this.generateExtra()}
      />
    );
  }
}

export default withStyles(useStyles)(Index);
